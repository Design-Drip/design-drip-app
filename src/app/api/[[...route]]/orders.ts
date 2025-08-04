import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import mongoose from "mongoose";
import { HTTPException } from "hono/http-exception";
import verifyAuth from "@/lib/middlewares/verifyAuth";
import { Order } from "@/models/order";
import { checkRole } from "@/lib/roles";
import { stripe } from "@/lib/stripe";

const app = new Hono()
  .use(verifyAuth)
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
          "shipping",
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
        } else if (search.length >= 3 && /^[a-fA-F0-9]+$/.test(search)) {
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
        }).populate({
          path: "items.designId",
          populate: {
            path: "shirt_color_id",
            populate: {
              path: "shirt_id",
              select: "name",
            },
          },
        });

        return c.json({
          id: order?._id?.toString() as string,
          userId: order?.userId,
          items: order?.items,
          totalAmount: order?.totalAmount,
          status: order?.status,
          createdAt: order?.createdAt,
          updatedAt: order?.updatedAt,
          paymentMethod: order?.paymentMethod,
          shipping: order?.shipping,
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
    zValidator(
      "json",
      z.object({
        status: z.enum([
          "pending",
          "processing",
          "shipping",
          "shipped",
          "delivered",
          "canceled",
        ]),
      })
    ),
    async (c) => {
      const orderId = c.req.param("id");
      const body = await c.req.json();
      const { status } = body;

      try {
        const currentOrder = await Order.findById(orderId);
        if (!currentOrder) {
          throw new HTTPException(404, {
            message: "Order not found",
          });
        }

        if (currentOrder.status === status) {
          return c.json({
            message: "Order status is already set to this value",
            order: currentOrder,
          });
        }

        if (currentOrder.status === "processing" && status === "canceled") {
          await stripe.refunds.create({
            payment_intent: currentOrder.stripePaymentIntentId,
          });

          return c.json({
            message: "Refund initiated for canceled order",
            order: currentOrder,
          });
        }

        currentOrder.status = status;
        await currentOrder.save();

        return c.json({
          id: currentOrder._id?.toString(),
          userId: currentOrder.userId,
          items: currentOrder.items,
          totalAmount: currentOrder.totalAmount,
          status: currentOrder.status,
          createdAt: currentOrder.createdAt,
          updatedAt: currentOrder.updatedAt,
          paymentMethod: currentOrder.paymentMethod,
        });
      } catch (error) {
        console.error(`Error updating order ${orderId}:`, error);
        throw new HTTPException(500, {
          message: "Failed to update order status",
        });
      }
    }
  )
  .get("/dashboard", async (c) => {
    try {
      // Get basic counts
      const totalOrders = await Order.countDocuments();

      // Get total revenue - tính theo logic mới: cộng processing, trừ canceled
      const revenueResult = await Order.aggregate([
        {
          $group: {
            _id: "$status",
            totalRevenue: { $sum: "$totalAmount" }
          }
        }
      ]);
      
      let totalRevenue = 0;
      revenueResult.forEach(item => {
        if (item._id === 'processing' || item._id === 'shipping' || item._id === 'shipped') {
          totalRevenue += item.totalRevenue;
        } else if (item._id === 'canceled') {
          totalRevenue -= item.totalRevenue;
        }
      });

      // Get recent orders (last 5)
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id totalAmount status createdAt");

      return c.json({
        success: true,
        data: {
          overview: {
            totalUsers: 0, // Will be populated later
            totalOrders,
            totalRevenue,
            totalProducts: 0, // Will be populated later
          },
          recentOrders,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return c.json(
        { success: false, error: "Failed to fetch dashboard stats" },
        500
      );
    }
  });

export default app;
