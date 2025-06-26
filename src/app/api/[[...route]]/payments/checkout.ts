import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { Cart } from "@/models/cart";
import { Design } from "@/models/design";
import { Shirt, ShirtColor, ShirtSizeVariant } from "@/models/product";
import { HTTPException } from "hono/http-exception";
import { clerkClient } from "@clerk/nextjs/server";
import verifyAuth from "@/lib/middlewares/verifyAuth";
import mongoose from "mongoose";
import { Order } from "@/models/order";

const app = new Hono()
  .use(verifyAuth)
  .get(
    "/info",
    zValidator("query", z.object({ itemIds: z.string().optional() })),
    async (c) => {
      const user = c.get("user")!;
      const itemIdsParam = c.req.query("itemIds");
      const itemIds = itemIdsParam ? itemIdsParam.split(",") : [];

      try {
        const cart = await Cart.findOne({ userId: user.id }).lean();

        if (!cart || cart.items.length === 0) {
          return c.json({
            items: [],
            totalAmount: 0,
            hasPaymentMethods: false,
            defaultPaymentMethod: null,
          });
        }

        // Filter cart items if itemIds are provided, otherwise use all items
        const filteredItems =
          itemIds.length > 0
            ? cart.items.filter((item) =>
                itemIds.includes(item._id!.toString())
              )
            : cart.items;

        if (filteredItems.length === 0) {
          return c.json({
            items: [],
            totalAmount: 0,
            hasPaymentMethods: false,
            defaultPaymentMethod: null,
          });
        }

        // Process cart items to calculate total
        const cartItems = await Promise.all(
          filteredItems.map(async (item) => {
            const design = await Design.findById(item.designId).lean();
            if (!design) return null;

            const shirtColor = await ShirtColor.findById(
              design.shirt_color_id
            ).lean();
            if (!shirtColor) return null;

            const shirt = await Shirt.findById(shirtColor.shirt_id).lean();
            if (!shirt) return null;

            const shirtSizeVariants = await ShirtSizeVariant.find({
              shirtColor: shirtColor._id,
            }).lean();

            let itemTotal = 0;
            item.quantityBySize.forEach((sizeQty) => {
              const variant = shirtSizeVariants.find(
                (v) => v.size === sizeQty.size
              );
              if (variant) {
                const price = shirt.base_price + variant.additional_price;
                itemTotal += price * sizeQty.quantity;
              }
            });

            return {
              id: item._id!.toString(),
              designId: design._id.toString(),
              designName: design.name,
              name: shirt.name,
              color: shirtColor.color,
              total: itemTotal,
            };
          })
        );

        const validCartItems = cartItems.filter((item) => item !== null);
        const totalAmount = validCartItems.reduce(
          (sum, item) => sum + item.total,
          0
        );

        // Check if user has payment methods
        const stripeId = user?.privateMetadata?.["stripe_cus_id"] as
          | string
          | undefined;
        let hasPaymentMethods = false;
        let defaultPaymentMethod = null;

        if (stripeId) {
          const paymentMethods = await stripe.customers.listPaymentMethods(
            stripeId,
            {
              type: "card",
            }
          );

          hasPaymentMethods = paymentMethods.data.length > 0;

          if (user?.privateMetadata?.["default_payment_method"]) {
            const defaultPmId = user.privateMetadata[
              "default_payment_method"
            ] as string;
            const defaultPm = paymentMethods.data.find(
              (pm) => pm.id === defaultPmId
            );

            if (defaultPm) {
              defaultPaymentMethod = defaultPm;
            }
          }
        }

        return c.json({
          items: validCartItems,
          totalAmount,
          hasPaymentMethods,
          defaultPaymentMethod,
        });
      } catch (error) {
        console.error("Error getting checkout info:", error);
        throw new HTTPException(500, {
          message: "Failed to get checkout information",
        });
      }
    }
  )
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        paymentMethodId: z.string().optional(),
        savePaymentMethod: z.boolean().optional(),
        paymentIntent: z.string().optional(),
        itemIds: z.array(z.string()).optional(),
        return_url: z.string().optional(),
      })
    ),
    async (c) => {
      const user = c.get("user")!;
      const {
        paymentMethodId,
        savePaymentMethod,
        paymentIntent,
        itemIds,
        return_url,
      } = c.req.valid("json");

      try {
        if (paymentIntent) {
          const intent = await stripe.paymentIntents.retrieve(paymentIntent);

          if (intent.status === "succeeded") {
            // Get the cart items data that were purchased
            const cart = await Cart.findOne({ userId: user.id }).lean();
            const itemIds = intent.metadata.itemIds
              ? intent.metadata.itemIds.split(",")
              : [];
            let filteredItems = cart.items;

            if (itemIds.length > 0) {
              filteredItems = cart.items.filter((item) =>
                itemIds.includes(item._id!.toString())
              );
            }

            // Transform cart items into order items
            const orderItems = await Promise.all(
              filteredItems.map(async (item) => {
                const design = await Design.findById(item.designId).lean();
                if (!design) return null;

                const shirtColor = await ShirtColor.findById(
                  design.shirt_color_id
                ).lean();
                if (!shirtColor) return null;

                const shirt = await Shirt.findById(shirtColor.shirt_id).lean();
                if (!shirt) return null;

                const shirtSizeVariants = await ShirtSizeVariant.find({
                  shirtColor: shirtColor._id,
                }).lean();

                const sizes = item.quantityBySize.map((sizeQty) => {
                  const variant = shirtSizeVariants.find(
                    (v) => v.size === sizeQty.size
                  );
                  const pricePerUnit = variant
                    ? shirt.base_price + variant.additional_price
                    : shirt.base_price;

                  return {
                    size: sizeQty.size,
                    quantity: sizeQty.quantity,
                    pricePerUnit,
                  };
                });

                const totalPrice = sizes.reduce(
                  (sum, sizeData) =>
                    sum + sizeData.pricePerUnit * sizeData.quantity,
                  0
                );

                // Get the first design image as preview
                let imageUrl = null;
                if (
                  design.design_images &&
                  Object.values(design.design_images).length > 0
                ) {
                  imageUrl = Object.values(design.design_images)[0];
                }

                return {
                  designId: design._id,
                  name: design.name,
                  color: shirtColor.color,
                  sizes,
                  totalPrice,
                  imageUrl,
                };
              })
            );

            // Filter out any null items
            const validOrderItems = orderItems.filter((item) => item !== null);

            // Get payment method details
            let paymentMethodDetails = null;
            if (intent.payment_method) {
              const paymentMethod = await stripe.paymentMethods.retrieve(
                intent.payment_method as string
              );
              paymentMethodDetails = paymentMethod.card;
            }

            const order = new Order({
              userId: user.id,
              stripePaymentIntentId: intent.id,
              status: "processing",
              items: validOrderItems,
              totalAmount: intent.amount,
              paymentMethod: "card",
              paymentMethodDetails,
            });
            await order.save();

            // Clear the purchased items from cart
            if (itemIds.length > 0) {
              await Cart.updateOne(
                { userId: user.id },
                {
                  $pull: {
                    items: {
                      _id: {
                        $in: itemIds.map(
                          (id) => new mongoose.Types.ObjectId(id)
                        ),
                      },
                    },
                  },
                }
              );
            }

            return c.json({
              success: true,
              orderId: order.id,
              status: "completed",
            });
          } else {
            return c.json(
              {
                success: false,
                status: intent.status,
                message: "Payment has not been completed",
              },
              400
            );
          }
        }

        // Get cart and calculate amount for selected items only
        const cart = await Cart.findOne({ userId: user.id }).lean();
        if (!cart || cart.items.length === 0) {
          throw new HTTPException(400, { message: "Cart is empty" });
        }

        // Filter cart items if itemIds are provided, otherwise use all items
        const filteredItems =
          itemIds && itemIds.length > 0
            ? cart.items.filter((item) =>
                itemIds.includes(item._id!.toString())
              )
            : cart.items;

        if (filteredItems.length === 0) {
          throw new HTTPException(400, {
            message: "No valid items selected for checkout",
          });
        }

        // Calculate total amount for selected items
        let totalAmount = 0;
        for (const item of filteredItems) {
          const design = await Design.findById(item.designId).lean();
          if (!design) continue;

          const shirtColor = await ShirtColor.findById(
            design.shirt_color_id
          ).lean();
          if (!shirtColor) continue;

          const shirt = await Shirt.findById(shirtColor.shirt_id).lean();
          if (!shirt) continue;

          const shirtSizeVariants = await ShirtSizeVariant.find({
            shirtColor: shirtColor._id,
          }).lean();

          item.quantityBySize.forEach((sizeQty) => {
            const variant = shirtSizeVariants.find(
              (v) => v.size === sizeQty.size
            );
            if (variant) {
              const price = shirt.base_price + variant.additional_price;
              totalAmount += price * sizeQty.quantity;
            }
          });
        }

        // VND doesn't use decimal places
        const amountInCents = Math.round(totalAmount);

        // Get or create customer
        const client = await clerkClient();
        let stripeId = user?.privateMetadata?.["stripe_cus_id"] as
          | string
          | undefined;

        if (!stripeId) {
          const customer = await stripe.customers.create({
            email: user?.emailAddresses[0]?.emailAddress,
            name: user?.fullName || undefined,
            metadata: {
              userId: user?.id!,
            },
          });

          stripeId = customer.id;

          await client.users.updateUserMetadata(user?.id!, {
            privateMetadata: {
              stripe_cus_id: stripeId,
            },
          });
        }

        // Create payment intent
        const paymentIntentParams: any = {
          amount: amountInCents,
          currency: "vnd",
          customer: stripeId,
          metadata: {
            userId: user.id,
            cartId: cart._id.toString(),
            itemIds: itemIds ? itemIds.join(",") : "",
          },
        };

        // If using saved payment method
        if (paymentMethodId) {
          paymentIntentParams.payment_method = paymentMethodId;
          paymentIntentParams.off_session = false; // User is present
          paymentIntentParams.confirm = true;
          paymentIntentParams.return_url =
            return_url || `${c.req.header("origin")}/orders`;
        } else {
          // If using automatic payment methods
          paymentIntentParams.automatic_payment_methods = {
            enabled: true,
            allow_redirects: "always",
          };
          // Return URL for redirect-based payment methods
          paymentIntentParams.return_url =
            return_url || `${c.req.header("origin")}/orders`;
        }

        // If saving new payment method
        if (savePaymentMethod && !paymentMethodId) {
          paymentIntentParams.setup_future_usage = "on_session";
        }

        const createdPaymentIntent = await stripe.paymentIntents.create(
          paymentIntentParams
        );

        return c.json({
          success: true,
          clientSecret: createdPaymentIntent.client_secret,
          paymentIntentId: createdPaymentIntent.id,
          requiresAction: createdPaymentIntent.status === "requires_action",
          status: createdPaymentIntent.status,
        });
      } catch (error) {
        console.error("Error processing checkout:", error);
        return c.json(
          { error: (error as Error).message || "Failed to process checkout" },
          500
        );
      }
    }
  );

export default app;
