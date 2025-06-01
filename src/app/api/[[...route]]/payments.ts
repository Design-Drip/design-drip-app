import { Hono } from "hono";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono()
  .get("/payment-methods", async (c) => {
    const { userId } = await auth();
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const stripeId = user.privateMetadata?.["stripe_cus_id"] as
      | string
      | undefined;

    if (!stripeId) {
      return c.json({ error: "No Stripe ID found" }, 404);
    }

    const paymentMethods = await stripe.customers.listPaymentMethods(stripeId, {
      type: "card",
    });

    const defaultPaymentMethod = paymentMethods.data.find(
      (pm) => pm.id === user.privateMetadata?.["default_payment_method"]
    );
    if (!defaultPaymentMethod) return c.json(paymentMethods.data);

    const newPaymentMethods = paymentMethods.data.map((pm) => {
      return {
        ...pm,
        isDefault: pm.id === defaultPaymentMethod.id,
      };
    });

    return c.json(newPaymentMethods);
  })
  .post(
    "/payment-methods/default",
    zValidator(
      "json",
      z.object({
        paymentMethodId: z.string().min(1, "Payment method ID is required"),
      })
    ),
    async (c) => {
      const { userId } = await auth();
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const stripeId = user.privateMetadata?.["stripe_cus_id"] as
        | string
        | undefined;

      if (!stripeId) {
        return c.json({ error: "No Stripe ID found" }, 404);
      }

      const { paymentMethodId } = c.req.valid("json");

      await stripe.customers.update(stripeId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      await client.users.updateUserMetadata(userId, {
        privateMetadata: {
          default_payment_method: paymentMethodId,
        },
      });

      return c.json({ success: true });
    }
  )
  .post(
    "/payment-methods/attach",
    zValidator(
      "json",
      z.object({
        paymentMethodId: z.string().min(1, "Payment method ID is required"),
        setAsDefault: z.boolean().optional(),
      })
    ),
    async (c) => {
      const { userId } = await auth();
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      let stripeId = user.privateMetadata?.["stripe_cus_id"] as
        | string
        | undefined;

      if (!stripeId) {
        const customer = await stripe.customers.create({
          email: user.emailAddresses[0]?.emailAddress,
          name: user.fullName || undefined,
          metadata: {
            userId,
          },
        });

        stripeId = customer.id;

        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            stripe_cus_id: stripeId,
          },
        });
      }

      try {
        const { paymentMethodId, setAsDefault } = c.req.valid("json");

        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: stripeId,
        });

        if (setAsDefault) {
          await stripe.customers.update(stripeId, {
            invoice_settings: {
              default_payment_method: paymentMethodId,
            },
          });

          await client.users.updateUserMetadata(userId, {
            privateMetadata: {
              default_payment_method: paymentMethodId,
            },
          });
        }

        return c.json({ success: true });
      } catch (error) {
        console.error("Error attaching payment method:", error);
        return c.json(
          {
            error:
              (error as Error).message || "Failed to attach payment method",
          },
          400
        );
      }
    }
  )
  .delete("/payment-methods/:id", async (c) => {
    const { userId } = await auth();
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const stripeId = user.privateMetadata?.["stripe_cus_id"] as
      | string
      | undefined;

    if (!stripeId) {
      return c.json({ error: "No Stripe ID found" }, 404);
    }

    const paymentMethodId = c.req.param("id");

    try {
      const isDefault =
        user.privateMetadata?.["default_payment_method"] === paymentMethodId;

      await stripe.paymentMethods.detach(paymentMethodId);

      if (isDefault) {
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            default_payment_method: null,
          },
        });
      }

      return c.json({ success: true });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      return c.json(
        {
          error: (error as Error).message || "Failed to delete payment method",
        },
        400
      );
    }
  });

export default app;
