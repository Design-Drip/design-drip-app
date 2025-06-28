import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import mongoose from "mongoose";
import { HTTPException } from "hono/http-exception";
import verifyAuth from "@/lib/middlewares/verifyAuth";
import { Order } from "@/models/order";

const app = new Hono()
  .use(verifyAuth)
  .get("/", async (c) => {
    const user = c.get("user")!;
    const page = Number(c.req.query("page") || "1");
    const limit = Number(c.req.query("limit") || "10");
    const status = c.req.query("status");

    try {
      const skip = (page - 1) * limit;

      const query: any = { userId: user.id };
      if (
        status &&
        ["pending", "processing", "shipped", "delivered", "canceled"].includes(
          status
        )
      ) {
        query.status = status;
      }

      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const totalOrders = await Order.countDocuments(query);
      const totalPages = Math.ceil(totalOrders / limit);

      return c.json({
        orders: orders.map((order) => ({
          id: order._id?.toString() as string,
          userId: order.userId,
          items: order.items,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        })),
        pagination: {
          page,
          limit,
          totalOrders,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw new HTTPException(500, { message: "Failed to fetch orders" });
    }
  })
  .get(
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
                message: "Invalid order ID",
              });
            }
            return true;
          }),
      })
    ),
    async (c) => {
      const user = c.get("user")!;
      const orderId = c.req.param("id");

      try {
        const order = await Order.findOne({
          _id: orderId,
          userId: user.id,
        }).lean();

        return c.json({
          id: order?._id?.toString() as string,
          userId: order?.userId,
          items: order?.items,
          totalAmount: order?.totalAmount,
          status: order?.status,
          createdAt: order?.createdAt,
          updatedAt: order?.updatedAt,
          paymentMethod: order?.paymentMethod,
        });
      } catch (error) {
        console.error(`Error fetching order ${orderId}:`, error);
        if (error instanceof HTTPException) {
          throw error;
        }
        throw new HTTPException(500, {
          message: "Failed to fetch order details",
        });
      }
    }
  );

export default app;
