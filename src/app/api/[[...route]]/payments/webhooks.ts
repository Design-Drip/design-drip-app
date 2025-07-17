import { stripe } from "@/lib/stripe";
import { Hono } from "hono";
import Stripe from "stripe";
import mongoose from "mongoose";
import { Order } from "@/models/order";
import { Cart } from "@/models/cart";

const app = new Hono().post("/", async (c) => {
  const body = await c.req.text();
  const endpointSecret = process.env.STRIPE_SECRET_WEBHOOK_KEY!;
  const sig = c.req.header("stripe-signature") as string;
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      endpointSecret
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return c.json({ error: (err as Error).message }, { status: 400 });
  }

  console.log(`Received Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case "payment_intent.canceled":
        await handlePaymentIntentCanceled(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return c.json({ received: true });
  } catch (err) {
    console.error(`Error handling webhook ${event.type}:`, err);
    return c.json({ error: "Webhook handler failed" }, { status: 500 });
  }
});

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log(`PaymentIntent ${paymentIntent.id} succeeded`);

  if (!paymentIntent.metadata?.userId) {
    console.log("No user ID in payment intent metadata, skipping order update");
    return;
  }

  if (!paymentIntent.metadata?.itemIds) {
    console.log(
      "No item IDs in payment intent metadata, skipping order update"
    );
    return;
  }

  const itemIds = paymentIntent.metadata.itemIds
    ? paymentIntent.metadata.itemIds.split(",")
    : [];

  try {
    const cart = await Cart.findOne({
      userId: paymentIntent.metadata.userId,
    });

    if (cart && cart.items.length > 0) {
      await cart.updateOne({
        $pull: {
          items: {
            _id: {
              $in: itemIds.map((id) => new mongoose.Types.ObjectId(id)),
            },
          },
        },
      });
    }

    const order = await Order.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (!order) {
      console.log(`No order found for payment intent ${paymentIntent.id}`);
      return;
    }

    if (order.status === "pending") {
      order.status = "processing";
      await order.save();
      console.log(`Order ${order.id} status updated to processing`);
    } else {
      console.log(
        `Order ${order.id} already in ${order.status} status, no update needed`
      );
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`PaymentIntent ${paymentIntent.id} failed`);

  try {
    // Find and update the order status
    const order = await Order.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (!order) {
      console.log(`No order found for payment intent ${paymentIntent.id}`);
      return;
    }

    // Only update if the order is still in a pending state
    if (order.status === "pending") {
      order.status = "canceled";
      order.paymentFailureReason =
        paymentIntent.last_payment_error?.message || "Payment failed";
      await order.save();
      console.log(
        `Order ${order.id} status updated to canceled due to payment failure`
      );
    }
  } catch (error) {
    console.error("Error updating order status after payment failure:", error);
    throw error;
  }
}

async function handlePaymentIntentCanceled(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log(`PaymentIntent ${paymentIntent.id} canceled`);

  try {
    // Find and update the order status
    const order = await Order.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (!order) {
      console.log(`No order found for payment intent ${paymentIntent.id}`);
      return;
    }

    // Don't update orders that have progressed beyond pending
    if (order.status === "pending") {
      order.status = "canceled";
      await order.save();
      console.log(`Order ${order.id} status updated to canceled`);
    }
  } catch (error) {
    console.error("Error updating order status after cancellation:", error);
    throw error;
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`Charge ${charge.id} refunded`);

  if (!charge.payment_intent) {
    console.log("No payment intent associated with this charge");
    return;
  }

  try {
    let paymentIntentId: string;

    if (typeof charge.payment_intent === "string") {
      paymentIntentId = charge.payment_intent;
    } else {
      paymentIntentId = charge.payment_intent.id;
    }

    // Find order by payment intent ID
    const order = await Order.findOne({
      stripePaymentIntentId: paymentIntentId,
    });

    if (!order) {
      console.log(`No order found for payment intent ${paymentIntentId}`);
      return;
    }

    // Only update if fully refunded
    if (charge.refunded) {
      order.status = "canceled";
      order.refundedAt = new Date();
      order.refundAmount = charge.amount_refunded;
      await order.save();
      console.log(`Order ${order.id} marked as canceled due to refund`);
    } else if (charge.amount_refunded > 0) {
      // Partial refund
      order.partiallyRefunded = true;
      order.refundAmount = charge.amount_refunded;
      await order.save();
      console.log(`Order ${order.id} marked as partially refunded`);
    }
  } catch (error) {
    console.error("Error updating order status after refund:", error);
    throw error;
  }
}

export default app;
