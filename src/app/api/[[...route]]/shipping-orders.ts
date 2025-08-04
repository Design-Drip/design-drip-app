import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import mongoose from "mongoose";
import { HTTPException } from "hono/http-exception";
import verifyAuth from "@/lib/middlewares/verifyAuth";
import { Order } from "@/models/order";
import { checkRole } from "@/lib/roles";

const app = new Hono()
  .use(verifyAuth)
  .get("/", async (c) => {
    const user = c.get("user")!;
    const isShipper = await checkRole("shipper");
    const isAdmin = await checkRole("admin");

    if (!isShipper && !isAdmin) {
      throw new HTTPException(403, {
        message: "Access denied. Shipper or admin role required.",
      });
    }

    try {
      // Get all orders with status "shipping" and not assigned to any shipper
      const shippingOrders = await Order.find({ 
        status: "shipping",
        $or: [
          { shipper_id: { $exists: false } },
          { shipper_id: null }
        ]
      })
        .populate({
          path: "items.designId",
          populate: {
            path: "shirt_color_id.shirt_id",
            select: "name"
          }
        })
        .sort({ createdAt: -1 })
        .lean();

      // Transform the data for frontend
      const transformedOrders = shippingOrders.map(order => ({
        id: order._id?.toString() as string,
        customerName: order.shipping?.name || "Unknown",
        customerEmail: "", // We'll need to get this from user data if needed
        customerPhone: order.shipping?.phone || "",
        address: formatAddress(order.shipping),
        status: order.status,
        assignedDate: order.createdAt,
        priority: getPriority(order.createdAt, order.shipping?.method),
        items: order.items.length,
        total: `$${order.totalAmount.toFixed(2)}`,
        orderItems: order.items,
        notes: order.notes || "",
        trackingNumber: generateTrackingNumber(order._id?.toString() || ""),
        estimatedDelivery: calculateEstimatedDelivery(order.createdAt, order.shipping?.method)
      }));

      return c.json({ orders: transformedOrders });
    } catch (error) {
      console.error("Error fetching shipping orders:", error);
      throw new HTTPException(500, {
        message: "Failed to fetch shipping orders",
      });
    }
  })
  .get("/my-orders", async (c) => {
    const user = c.get("user")!;
    const isShipper = await checkRole("shipper");

    if (!isShipper) {
      throw new HTTPException(403, {
        message: "Access denied. Shipper role required.",
      });
    }

    try {
             // Get orders assigned to the current shipper with status "shipping", "shipped", or "delivered"
       const myOrders = await Order.find({ 
         status: { $in: ["shipping", "shipped", "delivered"] },
         shipper_id: user.id
       })
        .populate({
          path: "items.designId",
          populate: {
            path: "shirt_color_id.shirt_id",
            select: "name"
          }
        })
        .sort({ createdAt: -1 })
        .lean();

      console.log("Raw orders from DB:", myOrders.map(order => ({
        id: order._id,
        status: order.status,
        shippingImage: order.shippingImage,
        shipper_id: order.shipper_id
      })));

      // Transform the data for frontend
      const transformedOrders = myOrders.map(order => ({
        id: order._id?.toString() as string,
        customerName: order.shipping?.name || "Unknown",
        customerEmail: "", // We'll need to get this from user data if needed
        customerPhone: order.shipping?.phone || "",
        address: formatAddress(order.shipping),
        status: order.status,
        assignedDate: order.createdAt,
        priority: getPriority(order.createdAt, order.shipping?.method),
        items: order.items.length,
        total: `$${order.totalAmount.toFixed(2)}`,
        orderItems: order.items,
        notes: order.notes || "",
        trackingNumber: generateTrackingNumber(order._id?.toString() || ""),
        estimatedDelivery: calculateEstimatedDelivery(order.createdAt, order.shipping?.method),
        shippingImage: order.shippingImage || null
      }));

      console.log("Transformed orders:", transformedOrders.map(order => ({
        id: order.id,
        status: order.status,
        shippingImage: order.shippingImage
      })));

      return c.json({ orders: transformedOrders });
    } catch (error) {
      console.error("Error fetching my orders:", error);
      throw new HTTPException(500, {
        message: "Failed to fetch my orders",
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
      const isShipper = await checkRole("shipper");
      const isAdmin = await checkRole("admin");

      if (!isShipper && !isAdmin) {
        throw new HTTPException(403, {
          message: "Access denied. Shipper or admin role required.",
        });
      }

      try {
        // Get order by ID
        const order = await Order.findById(orderId)
          .populate({
            path: "items.designId",
            populate: {
              path: "shirt_color_id.shirt_id",
              select: "name"
            }
          })
          .lean();

        if (!order) {
          throw new HTTPException(404, {
            message: "Order not found",
          });
        }

        // Transform the data for frontend
        const transformedOrder = {
          id: order._id?.toString() as string,
          customerName: order.shipping?.name || "Unknown",
          customerEmail: "", // We'll need to get this from user data if needed
          customerPhone: order.shipping?.phone || "",
          address: formatAddress(order.shipping),
          status: order.status,
          pickupDate: order.createdAt,
          estimatedDelivery: calculateEstimatedDelivery(order.createdAt, order.shipping?.method),
          actualDelivery: null, // This would be updated when order is delivered
          priority: getPriority(order.createdAt, order.shipping?.method),
          items: order.items.map(item => ({
            id: item.designId?._id?.toString() || "",
            name: item.name,
            quantity: item.sizes.reduce((total, size) => total + size.quantity, 0),
            price: `$${item.totalPrice.toFixed(2)}`,
            total: `$${item.totalPrice.toFixed(2)}`
          })),
          subtotal: `$${(order.totalAmount - (order.shipping?.cost || 0)).toFixed(2)}`,
          shipping: `$${(order.shipping?.cost || 0).toFixed(2)}`,
          total: `$${order.totalAmount.toFixed(2)}`,
          notes: order.notes || "",
          trackingNumber: generateTrackingNumber(order._id?.toString() || ""),
          shipperNotes: "Package ready for pickup from warehouse"
        };

        return c.json({ order: transformedOrder });
      } catch (error) {
        console.error("Error fetching shipping order:", error);
        if (error instanceof HTTPException) {
          throw error;
        }
        throw new HTTPException(500, {
          message: "Failed to fetch shipping order details",
        });
      }
    }
  )
  .patch(
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
        notes: z.string().optional(),
      })
    ),
    async (c) => {
      const orderId = c.req.param("id");
      const body = await c.req.json();
      const { status, notes } = body;
      const isShipper = await checkRole("shipper");
      const isAdmin = await checkRole("admin");

      if (!isShipper && !isAdmin) {
        throw new HTTPException(403, {
          message: "Access denied. Shipper or admin role required.",
        });
      }

      try {
        // Update order status
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {
            status,
            notes: notes || undefined,
            updatedAt: new Date()
          },
          { new: true, lean: true }
        );

        if (!updatedOrder) {
          throw new HTTPException(404, {
            message: "Order not found",
          });
        }

        return c.json({ 
          message: "Order status updated successfully",
          order: updatedOrder 
        });
      } catch (error) {
        console.error("Error updating shipping order:", error);
        if (error instanceof HTTPException) {
          throw error;
        }
        throw new HTTPException(500, {
          message: "Failed to update order status",
        });
      }
    }
  )
  .patch(
    "/:id/upload-shipping-image",
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
        shippingImage: z.string().url(),
      })
    ),
    async (c) => {
      const orderId = c.req.param("id");
      const user = c.get("user")!;
      const body = await c.req.json();
      const { shippingImage } = body;
      const isShipper = await checkRole("shipper");

      if (!isShipper) {
        throw new HTTPException(403, {
          message: "Access denied. Shipper role required.",
        });
      }

      try {
        // Check if order exists and is assigned to this shipper
        const existingOrder = await Order.findById(orderId).lean();
        
        if (!existingOrder) {
          throw new HTTPException(404, {
            message: "Order not found",
          });
        }

        if (existingOrder.shipper_id !== user.id) {
          throw new HTTPException(403, {
            message: "Access denied. This order is not assigned to you.",
          });
        }

        if (existingOrder.status !== "shipping" && existingOrder.status !== "shipped") {
          throw new HTTPException(400, {
            message: "Order status must be 'shipping' or 'shipped' to upload shipping image",
          });
        }

        console.log("Updating order with shipping image:", { orderId, shippingImage });
        
        // Use MongoDB native driver to ensure field creation
        const db = mongoose.connection.db;
        if (!db) {
          throw new HTTPException(500, {
            message: "Database connection not available",
          });
        }
        const ordersCollection = db.collection('orders');
        
        // Only change status to "shipped" if it's currently "shipping"
        const updateData: any = {
          shippingImage,
          updatedAt: new Date()
        };
        
        if (existingOrder.status === "shipping") {
          updateData.status = "shipped";
        }
        
        const updateResult = await ordersCollection.updateOne(
          { _id: new mongoose.Types.ObjectId(orderId) },
          { 
            $set: updateData
          }
        );
        
        console.log("Update result:", updateResult);

        // Get the updated order
        const updatedOrder = await Order.findById(orderId).lean();

        console.log("Updated order result:", { 
          orderId: updatedOrder?._id, 
          shippingImage: updatedOrder?.shippingImage,
          status: updatedOrder?.status,
          allFields: Object.keys(updatedOrder || {})
        });

        const message = existingOrder.status === "shipping" 
          ? "Shipping image uploaded successfully and order status updated to shipped"
          : "Shipping image updated successfully";
          
        return c.json({ 
          message,
          order: updatedOrder 
        });
      } catch (error) {
        console.error("Error uploading shipping image:", error);
        if (error instanceof HTTPException) {
          throw error;
        }
        throw new HTTPException(500, {
          message: "Failed to upload shipping image",
        });
      }
    }
  )
  .patch(
    "/:id/assign",
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
      const orderId = c.req.param("id");
      const user = c.get("user")!;
      const isShipper = await checkRole("shipper");

      if (!isShipper) {
        throw new HTTPException(403, {
          message: "Access denied. Shipper role required.",
        });
      }

       try {
         console.log("Assigning order:", { orderId, userId: user.id });
        
        // Check if order is already assigned to another shipper
        const existingOrder = await Order.findById(orderId).lean();
        
        if (!existingOrder) {
          throw new HTTPException(404, {
            message: "Order not found",
          });
        }

        console.log("Existing order:", { 
          orderId: existingOrder._id, 
          currentShipperId: existingOrder.shipper_id,
          userId: user.id 
        });

        if (existingOrder.shipper_id && existingOrder.shipper_id !== user.id) {
          throw new HTTPException(400, {
            message: "Order is already assigned to another shipper",
          });
        }

        // Assign order to shipper using MongoDB native driver
        console.log("Updating order with shipper_id:", user.id);
        
        // Use MongoDB native driver to ensure field creation
        const db = mongoose.connection.db;
        if (!db) {
          throw new HTTPException(500, {
            message: "Database connection not available",
          });
        }
        const ordersCollection = db.collection('orders');
        
        const updateResult = await ordersCollection.updateOne(
          { _id: new mongoose.Types.ObjectId(orderId) },
          { 
            $set: { 
              shipper_id: user.id,
              updatedAt: new Date()
            }
          }
        );
        
        console.log("Update result:", updateResult);

        // Get the updated order
        const updatedOrder = await Order.findById(orderId).lean();

        console.log("Updated order:", updatedOrder);
        
        console.log("Updated order result:", { 
          orderId: updatedOrder?._id, 
          shipperId: updatedOrder?.shipper_id,
          allFields: Object.keys(updatedOrder || {})
        });

        // Force create the field if it doesn't exist
        if (updatedOrder && updatedOrder.shipper_id === undefined) {
          console.log("Field shipper_id doesn't exist, forcing creation...");
          
          const forceUpdateResult = await Order.updateOne(
            { _id: orderId },
            { 
              $set: { 
                shipper_id: user.id,
                updatedAt: new Date()
              }
            },
            { upsert: false }
          );
          
          console.log("Force update result:", forceUpdateResult);
          
          // Get the order again
          const finalOrder = await Order.findById(orderId).lean();
          console.log("Final order result:", { 
            orderId: finalOrder?._id, 
            shipperId: finalOrder?.shipper_id,
            allFields: Object.keys(finalOrder || {})
          });
          
          return c.json({ 
            message: "Order assigned successfully",
            order: finalOrder 
          });
        }

        return c.json({ 
          message: "Order assigned successfully",
          order: updatedOrder 
        });
      } catch (error) {
        console.error("Error assigning order:", error);
        if (error instanceof HTTPException) {
          throw error;
        }
        throw new HTTPException(500, {
          message: "Failed to assign order",
        });
      }
    }
  )
  .patch(
    "/:id/unassign",
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
      const orderId = c.req.param("id");
      const user = c.get("user")!;
      const isShipper = await checkRole("shipper");

      if (!isShipper) {
        throw new HTTPException(403, {
          message: "Access denied. Shipper role required.",
        });
      }

      try {
        console.log("Unassigning order:", { orderId, userId: user.id });
        
        // Check if order exists and is assigned to this shipper
        const existingOrder = await Order.findById(orderId).lean();
        
        if (!existingOrder) {
          throw new HTTPException(404, {
            message: "Order not found",
          });
        }

        if (existingOrder.shipper_id !== user.id) {
          throw new HTTPException(403, {
            message: "Access denied. This order is not assigned to you.",
          });
        }

        // Only allow unassign for orders with status "shipping"
        if (existingOrder.status !== "shipping") {
          throw new HTTPException(400, {
            message: "Only orders with status 'shipping' can be unassigned.",
          });
        }

        // Unassign order by removing shipper_id
        console.log("Unassigning order by removing shipper_id");
        
        const db = mongoose.connection.db;
        if (!db) {
          throw new HTTPException(500, {
            message: "Database connection not available",
          });
        }
        const ordersCollection = db.collection('orders');
        
        const updateResult = await ordersCollection.updateOne(
          { _id: new mongoose.Types.ObjectId(orderId) },
          { 
            $unset: { 
              shipper_id: ""
            },
            $set: {
              updatedAt: new Date()
            }
          }
        );
        
        console.log("Unassign update result:", updateResult);

        // Get the updated order
        const updatedOrder = await Order.findById(orderId).lean();

        console.log("Updated order after unassign:", updatedOrder);
        
        return c.json({ 
          message: "Order unassigned successfully",
          order: updatedOrder 
        });
      } catch (error) {
        console.error("Error unassigning order:", error);
        if (error instanceof HTTPException) {
          throw error;
        }
        throw new HTTPException(500, {
          message: "Failed to unassign order",
        });
      }
    }
  );

function formatAddress(shipping: any): string {
  if (!shipping) return "No address provided";
  
  const parts = [
    shipping.address?.line1,
    shipping.address?.line2,
    shipping.address?.city,
    shipping.address?.state,
    shipping.address?.postal_code,
    shipping.address?.country
  ].filter(Boolean);
  
  return parts.join(", ");
}

function getPriority(createdAt: Date, shippingMethod?: string): "high" | "medium" | "low" {
  const daysSinceCreated = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  
  if (shippingMethod === "express") return "high";
  if (daysSinceCreated > 3) return "high";
  if (daysSinceCreated > 1) return "medium";
  return "low";
}

function generateTrackingNumber(orderId: string): string {
  // Generate a tracking number based on order ID
  const timestamp = Date.now().toString().slice(-6);
  const orderSuffix = orderId.slice(-4);
  return `TRK${timestamp}${orderSuffix}`.toUpperCase();
}

function calculateEstimatedDelivery(createdAt: Date, shippingMethod?: string): string {
  const created = new Date(createdAt);
  const estimatedDays = shippingMethod === "express" ? 2 : 5;
  const estimatedDate = new Date(created.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
  return estimatedDate.toISOString().split('T')[0];
}

export default app; 