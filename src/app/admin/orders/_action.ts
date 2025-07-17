import mongoose from "mongoose";
import { Order } from "@/models/order";
import dbConnect from "@/lib/db";

interface OrderItem {
  designId: string;
  name: string;
  color: string;
  sizes: {
    size: string;
    quantity: number;
    pricePerUnit: number;
  }[];
  totalPrice: number;
  imageUrl?: string;
}

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled";

// Renamed to OrderData to avoid conflict with the imported Order model
interface OrderData {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
}

interface OrdersResponse {
  data: OrderData[];
  pagination: {
    totalOrders: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function getOrders(
  page = 1,
  limit = 10,
  status?: string,
  search?: string
): Promise<OrdersResponse> {
  try {
    await dbConnect();

    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.$or = [{ "items.name": { $regex: search, $options: "i" } }];
    }
    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    const data = orders.map((order) => ({
      id: order._id.toString(),
      userId: order.userId.toString(),
      items: order.items.map((item) => ({
        designId: item.designId.toString(),
        name: item.name,
        color: item.color,
        sizes: item.sizes.map((size) => ({
          size: size.size,
          quantity: size.quantity,
          pricePerUnit: size.pricePerUnit,
        })),
        totalPrice: item.totalPrice,
        imageUrl: item.imageUrl,
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      paymentMethod: order.paymentMethod,
    }));

    const totalPages = Math.ceil(totalOrders / limit);
    const pagination = {
      totalOrders,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return {
      data,
      pagination,
    };
  } catch (error) {
    console.error("Error in getOrders:", error);
    throw new Error("Failed to fetch orders");
  }
}

export async function getOrderById(orderId: string) {
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return null;
    }

    const order = await Order.findById(orderId).lean();

    if (!order) {
      return null;
    }

    return {
      id: order._id.toString(),
      userId: order.userId.toString(),
      items: order.items.map((item: any) => ({
        designId: item.designId.toString(),
        name: item.name,
        color: item.color,
        sizes: item.sizes.map((size: any) => ({
          size: size.size,
          quantity: size.quantity,
          pricePerUnit: size.pricePerUnit,
        })),
        totalPrice: item.totalPrice,
        imageUrl: item.imageUrl,
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      paymentMethod: order.paymentMethod,
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}
