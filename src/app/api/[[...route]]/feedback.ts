import mongoose from "mongoose";
import verifyAuth from "@/lib/middlewares/verifyAuth";
import { Feedback } from "@/models/feedback";
import { Order } from "@/models/order";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const app = new Hono()
  .use(verifyAuth)
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
                message: "Invalid product ID",
              });
            }
            return true;
          }),
      })
    ),
    async (c) => {
      let sortOptions: any = { createdAt: -1 };
      const productId = c.req.param("id");
      const orders = await Order.find().populate({
        path: "items.designId",
        populate: {
          path: "shirt_color_id",
          populate: {
            path: "shirt_id",
            select: "name",
          },
        },
      });
      const filteredOrders = orders.filter((order) =>
        order.items.some(
          (item) =>
            item.designId?.shirt_color_id?.shirt_id?._id?.toString() ===
            productId
        )
      );
      const feedbacks = await Feedback.find()
        .sort(sortOptions)
        .lean();
      const productFeedbacks = feedbacks.filter((feedback) =>
        filteredOrders.some(
          (order) => order._id.toString() === feedback.orderId.toString()
        )
      );
      try {
        
        return c.json({
          data: productFeedbacks.map((feedback) => ({
            ...feedback,
            id: feedback._id.toString(),
          })),
        });
      } catch (error) {
        throw new HTTPException(500, {
          message: "Failed to fetch feedback",
        });
      }
    }
  )
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        orderId: z
          .string()
          .refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "Invalid order ID",
          }),
        rating: z.number().min(1).max(5),
        comment: z.string().trim().optional(),
      })
    ),
    async (c) => {
      const body = await c.req.json();
      const { orderId, rating, comment } = body;
      try {
        const order = await Order.findById(orderId).lean();
        if (!order) {
          throw new HTTPException(404, {
            message: "Order not found",
          });
        }
        const feedback = new Feedback({
          orderId,
          rating,
          comment,
        });
        await feedback.save();
        return c.json({
          message: "Feedback submitted successfully!",
          data: feedback,
        });
      } catch (error) {
        throw new HTTPException(500, {
          message: "Failed to add feedback",
        });
      }
    }
  );

export default app;
