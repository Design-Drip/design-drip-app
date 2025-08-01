import { Hono } from "hono";
import { Order } from "@/models/order";
import { Design } from "@/models/design";
import user from "@/models/user";
import { Shirt } from "@/models/product";

const app = new Hono()
  .get("/", async (c) => {
    try {
      // Get basic counts
      const [totalUsers, totalOrders, totalProducts] = await Promise.all([
        user.countDocuments(),
        Order.countDocuments(),
        Shirt.countDocuments(),
      ]);

      // Get total revenue
      const revenueResult = await Order.aggregate([
        { $match: { status: { $ne: "canceled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
      ]);
      const totalRevenue = revenueResult[0]?.totalRevenue || 0;

      // Get recent orders (last 5)
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id totalAmount status createdAt");

      return c.json({
        success: true,
        data: {
          overview: {
            totalUsers,
            totalOrders,
            totalRevenue,
            totalProducts,
          },
          recentOrders
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return c.json({ success: false, error: "Failed to fetch dashboard stats" }, 500);
    }
  });

export default app;
