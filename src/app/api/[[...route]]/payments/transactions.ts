import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { HTTPException } from "hono/http-exception";
import verifyAdmin from "@/lib/middlewares/verifyAdmin";
import { Order } from "@/models/order";
import Stripe from "stripe";

const app = new Hono()
  .use(verifyAdmin)
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("20"),
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        minAmount: z.string().optional(),
        maxAmount: z.string().optional(),
        email: z.string().optional(),
      })
    ),
    async (c) => {
      try {
        const {
          page,
          limit,
          status,
          startDate,
          endDate,
          minAmount,
          maxAmount,
          email,
        } = c.req.valid("query");

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Build Stripe query parameters
        const stripeParams: Stripe.ChargeListParams = {
          limit: limitNum,
        };

        // Date filters
        if (startDate || endDate) {
          stripeParams.created = {};
          if (startDate) {
            stripeParams.created.gte = Math.floor(
              new Date(startDate).getTime() / 1000
            );
          }
          if (endDate) {
            stripeParams.created.lte = Math.floor(
              new Date(endDate).getTime() / 1000
            );
          }
        }

        // Get charges from Stripe
        let charges = await stripe.charges.list(stripeParams);
        let allCharges = charges.data;

        // For pagination beyond first page, we need to implement cursor-based pagination
        if (pageNum > 1) {
          const skip = (pageNum - 1) * limitNum;
          // This is a simplified approach - in production, you might want to implement proper cursor-based pagination
          let hasMore = charges.has_more;
          let lastChargeId = charges.data[charges.data.length - 1]?.id;
          let currentSkip = limitNum;

          while (hasMore && currentSkip < skip + limitNum) {
            const nextCharges = await stripe.charges.list({
              ...stripeParams,
              starting_after: lastChargeId,
            });

            allCharges = allCharges.concat(nextCharges.data);
            hasMore = nextCharges.has_more;
            lastChargeId = nextCharges.data[nextCharges.data.length - 1]?.id;
            currentSkip += nextCharges.data.length;
          }

          // Apply pagination
          allCharges = allCharges.slice(skip, skip + limitNum);
        }

        // Apply filters
        let filteredCharges = allCharges;

        // Status filter
        if (status && status !== "all") {
          filteredCharges = filteredCharges.filter((charge) => {
            switch (status) {
              case "succeeded":
                return charge.status === "succeeded" && !charge.refunded;
              case "refunded":
                return charge.refunded;
              case "disputed":
                return charge.disputed;
              case "failed":
                return charge.status === "failed";
              case "uncaptured":
                return !charge.captured;
              default:
                return true;
            }
          });
        }

        // Amount filters
        if (minAmount) {
          const minAmountCents = parseFloat(minAmount) * 100;
          filteredCharges = filteredCharges.filter(
            (charge) => charge.amount >= minAmountCents
          );
        }
        if (maxAmount) {
          const maxAmountCents = parseFloat(maxAmount) * 100;
          filteredCharges = filteredCharges.filter(
            (charge) => charge.amount <= maxAmountCents
          );
        }

        // Email filter
        if (email) {
          const customerIds = new Set();

          // Get customers by email
          const customers = await stripe.customers.list({
            email: email,
            limit: 100,
          });

          customers.data.forEach((customer) => customerIds.add(customer.id));

          filteredCharges = filteredCharges.filter(
            (charge) => charge.customer && customerIds.has(charge.customer)
          );
        }

        // Get associated orders for each transaction
        const transactionsWithOrders = await Promise.all(
          filteredCharges.map(async (charge) => {
            let order = null;
            let customer = null;

            // Get customer details
            if (charge.customer) {
              try {
                customer = await stripe.customers.retrieve(
                  charge.customer as string
                );
              } catch (error) {
                console.error("Error fetching customer:", error);
              }
            }

            // Find associated order
            if (charge.payment_intent) {
              try {
                order = await Order.findOne({
                  stripePaymentIntentId: charge.payment_intent,
                }).lean();
              } catch (error) {
                console.error("Error fetching order:", error);
              }
            }

            return {
              id: charge.id,
              amount: charge.amount,
              currency: charge.currency,
              status: charge.status,
              created: charge.created,
              description: charge.description,
              customer: customer
                ? {
                    id: customer.id,
                    email: (customer as Stripe.Customer).email,
                    name: (customer as Stripe.Customer).name,
                  }
                : null,
              paymentMethod: charge.payment_method_details?.type || "unknown",
              refunded: charge.refunded,
              refundedAmount: charge.amount_refunded,
              disputed: charge.disputed,
              captured: charge.captured,
              failureCode: charge.failure_code,
              failureMessage: charge.failure_message,
              order: order
                ? {
                    id: order._id.toString(),
                    totalAmount: order.totalAmount,
                    status: order.status,
                  }
                : null,
            };
          })
        );

        // Calculate pagination info
        const totalCount = await stripe.charges.list({ limit: 1 });
        const hasNextPage =
          pageNum * limitNum < (totalCount.data.length > 0 ? 1000 : 0); // Stripe has pagination limits
        const hasPrevPage = pageNum > 1;

        return c.json({
          transactions: transactionsWithOrders,
          pagination: {
            page: pageNum,
            limit: limitNum,
            hasNextPage,
            hasPrevPage,
            totalPages: Math.ceil(1000 / limitNum), // Approximate due to Stripe limitations
          },
        });
      } catch (error) {
        console.error("Error fetching transactions:", error);
        throw new HTTPException(500, {
          message: "Failed to fetch transactions",
        });
      }
    }
  )
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().min(1, "Transaction ID is required"),
      })
    ),
    async (c) => {
      try {
        const transactionId = c.req.param("id");

        // Get charge details from Stripe
        const charge = (await stripe.charges.retrieve(transactionId, {
          expand: ["customer", "payment_intent", "dispute"],
        })) as Stripe.Response<
          Stripe.Charge & {
            dispute: Stripe.Dispute | null;
          }
        >;

        // Get customer details
        let customer = null;
        if (charge.customer) {
          customer =
            typeof charge.customer === "string"
              ? await stripe.customers.retrieve(charge.customer)
              : charge.customer;
        }

        // Get payment intent details
        let paymentIntent = null;
        if (charge.payment_intent) {
          paymentIntent =
            typeof charge.payment_intent === "string"
              ? await stripe.paymentIntents.retrieve(charge.payment_intent)
              : charge.payment_intent;
        }

        // Find associated order in our system
        let order = null;
        if (charge.payment_intent) {
          const paymentIntentId =
            typeof charge.payment_intent === "string"
              ? charge.payment_intent
              : charge.payment_intent.id;

          order = await Order.findOne({
            stripePaymentIntentId: paymentIntentId,
          }).lean();
        }

        // Get refund details if any
        let refunds: Stripe.Refund[] = [];
        if (charge.refunded) {
          const refundsList = await stripe.refunds.list({
            charge: charge.id,
          });
          refunds = refundsList.data;
        }

        // Get dispute details if any
        let dispute = null;
        if (charge.disputed && charge.dispute) {
          dispute =
            typeof charge.dispute === "string"
              ? await stripe.disputes.retrieve(charge.dispute)
              : charge.dispute;
        }

        return c.json({
          id: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          status: charge.status,
          created: charge.created,
          description: charge.description,
          receiptUrl: charge.receipt_url,
          customer: customer
            ? {
                id: customer.id,
                email: (customer as Stripe.Customer).email,
                name: (customer as Stripe.Customer).name,
                phone: (customer as Stripe.Customer).phone,
              }
            : null,
          paymentMethod: {
            type: charge.payment_method_details?.type || "unknown",
            details: charge.payment_method_details,
          },
          paymentIntent: paymentIntent
            ? {
                id: paymentIntent.id,
                status: paymentIntent.status,
                clientSecret: paymentIntent.client_secret,
              }
            : null,
          refunded: charge.refunded,
          refundedAmount: charge.amount_refunded,
          refunds: refunds.map((refund) => ({
            id: refund.id,
            amount: refund.amount,
            created: refund.created,
            reason: refund.reason,
            status: refund.status,
          })),
          disputed: charge.disputed,
          dispute: dispute
            ? {
                id: dispute.id,
                amount: dispute.amount,
                reason: dispute.reason,
                status: dispute.status,
                created: dispute.created,
              }
            : null,
          captured: charge.captured,
          failureCode: charge.failure_code,
          failureMessage: charge.failure_message,
          billing: charge.billing_details,
          shipping: charge.shipping,
          order: order
            ? {
                id: order._id.toString(),
                totalAmount: order.totalAmount,
                status: order.status,
                items: order.items,
                createdAt: order.createdAt,
                shipping: order.shipping,
              }
            : null,
        });
      } catch (error) {
        console.error("Error fetching transaction details:", error);
        if ((error as any).code === "resource_missing") {
          throw new HTTPException(404, {
            message: "Transaction not found",
          });
        }
        throw new HTTPException(500, {
          message: "Failed to fetch transaction details",
        });
      }
    }
  );

export default app;
