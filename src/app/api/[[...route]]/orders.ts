import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import mongoose from "mongoose";
import { HTTPException } from "hono/http-exception";
import verifyAuth from "@/lib/middlewares/verifyAuth";
import { Order } from "@/models/order";
import { checkRole } from "@/lib/roles";

const app = new Hono()
  .get("/", async (c) => {
    const user = c.get("user")!;
    const isAdmin = await checkRole("admin");
    const page = Number(c.req.query("page") || "1");
    const limit = Number(c.req.query("limit") || "10");
    const status = c.req.query("status");
    const search = c.req.query("search");

    try {
      const skip = (page - 1) * limit;
      let query: Record<string, any> = {};

      if (!isAdmin) {
        query.userId = user.id;
      }

      if (
        status &&
        [
          "pending",
          "processing",
          "shipped",
          "delivered",
          "canceled",
        ].includes(status)
      ) {
        query.status = status;
      }

      // Add search functionality
      if (search) {
        const searchRegex = new RegExp(search, "i");

        // If search looks like an ObjectId or partial ObjectId, search by _id
        if (mongoose.isObjectIdOrHexString(search)) {
          query._id = search;
        } else if (
          search.length >= 3 &&
          /^[a-fA-F0-9]+$/.test(search)
        ) {
          // Partial ObjectId search (at least 3 hex characters)
          query._id = new RegExp(search, "i");
        } else {
          // Search in multiple fields
          query.$or = [
            { userId: searchRegex },
            { "items.name": searchRegex },
            { "items.color": searchRegex },
            { paymentMethod: searchRegex },
          ];
        }
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
          paymentMethod: order.paymentMethod,
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
      throw new HTTPException(500, {
        message: "Failed to fetch orders",
      });
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
  )
  .put(
    "/:id/status",
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
    zValidator("json", z.object({
      status: z.enum(["pending", "processing", "shipped", "delivered", "canceled"]),
    })),
    async (c) => {
      const orderId = c.req.param("id");
      const isAdmin = await checkRole("admin");
      if (!isAdmin) {
        throw new HTTPException(403, { message: "Forbidden" });
      }

      const body = await c.req.json();
      const { status } = body;

      if (
        ![
          "pending",
          "processing",
          "shipped",
          "delivered",
          "canceled",
        ].includes(status)
      ) {
        throw new HTTPException(400, {
          message: "Invalid order status",
        });
      }

      try {
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { status },
          { new: true, lean: true }
        );

        if (!updatedOrder) {
          throw new HTTPException(404, {
            message: "Order not found",
          });
        }

        return c.json({
          id: updatedOrder._id?.toString() as string,
          userId: updatedOrder.userId,
          items: updatedOrder.items,
          totalAmount: updatedOrder.totalAmount,
          status: updatedOrder.status,
          createdAt: updatedOrder.createdAt,
          updatedAt: updatedOrder.updatedAt,
          paymentMethod: updatedOrder.paymentMethod,
        });
      } catch (error) {
        console.error(`Error updating order ${orderId}:`, error);
        throw new HTTPException(500, {
          message: "Failed to update order status",
        });
      }
    }
  );

export default app;
