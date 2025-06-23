import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import mongoose from "mongoose";
import verifyAuth from "@/lib/middlewares/verifyAuth";
import { HTTPException } from "hono/http-exception";
import { clerkClient } from "@clerk/nextjs/server";
import { Shirt } from "@/models/product";

const app = new Hono()
  .use(verifyAuth)
  .get("/", async (c) => {
    const user = c.get("user");
    const wishList =
      (user?.privateMetadata?.["wish_list"] as string[] | undefined) || [];

    return c.json(wishList);
  })
  .post(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z
          .string()
          .trim()
          .refine((val) => {
            if (!mongoose.isObjectIdOrHexString(val)) {
              throw new HTTPException(400, {
                message: "Invalid product ID",
              });
            }
            return true;
          }),
      })
    ),
    async (c) => {
      const user = c.get("user");

      const wishList =
        (user?.privateMetadata?.["wish_list"] as string[] | undefined) || [];
      const productId = c.req.param("id");

      if (wishList.includes(productId)) {
        return c.json({ error: "Item already in wish list" }, 400);
      }

      // Check if the product ID is valid
      const product = await Shirt.findById(productId);
      if (!product) {
        return c.json({ error: "Product not found" }, 404);
      }

      wishList.push(productId);

      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(user?.id!, {
          privateMetadata: {
            wish_list: wishList,
          },
        });

        return c.json({ success: true, data: wishList });
      } catch (error) {
        console.error("Error updating wish list:", error);
        return c.json(
          { error: (error as Error).message || "Failed to update wish list" },
          500
        );
      }
    }
  )
  .delete(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z
          .string()
          .trim()
          .refine((val) => {
            if (!mongoose.isObjectIdOrHexString(val)) {
              throw new HTTPException(400, {
                message: "Invalid product ID",
              });
            }
            return true;
          }),
      })
    ),
    async (c) => {
      const user = c.get("user");
      const wishList =
        (user?.privateMetadata?.["wish_list"] as string[] | undefined) || [];
      const productId = c.req.param("id");

      if (!wishList.includes(productId)) {
        return c.json({ error: "Item not found in wish list" }, 404);
      }

      const updatedWishList = wishList.filter((id) => id !== productId);

      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(user?.id!, {
          privateMetadata: {
            wish_list: updatedWishList,
          },
        });

        return c.json({ success: true, data: updatedWishList });
      } catch (error) {
        console.error("Error updating wish list:", error);
        return c.json(
          { error: (error as Error).message || "Failed to update wish list" },
          500
        );
      }
    }
  );

export default app;
