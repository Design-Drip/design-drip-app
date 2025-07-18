import { Hono } from "hono";
import { Order } from "@/models/order";
import { Shirt } from "@/models/product";
import User from "@/models/user";
import { DesignTemplate } from "@/models/design-template";

const app = new Hono()
  .get("/", async (c) => {
    try {
      // Get orders statistics
      const orderStats = await Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
            },
            processingOrders: {
              $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] }
            },
            shippedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] }
            },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] }
            },
            canceledOrders: {
              $sum: { $cond: [{ $eq: ["$status", "canceled"] }, 1, 0] }
            }
          }
        }
      ]);

      // Get products statistics
      const productStats = await Shirt.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
            },
            inactiveProducts: {
              $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] }
            }
          }
        }
      ]);

      // Get variants statistics
      const variantStats = await Shirt.aggregate([
        { $unwind: "$variants" },
        {
          $group: {
            _id: null,
            totalVariants: { $sum: 1 },
            variantsWithImages: {
              $sum: {
                $cond: [
                  { $and: [
                    { $ne: ["$variants.images", null] },
                    { $gt: [{ $size: "$variants.images" }, 0] }
                  ]},
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      // Get user count
      const userCount = await User.countDocuments();

      // Get design templates count
      const designTemplateCount = await DesignTemplate.countDocuments();

      // Get recent orders for activity
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("_id totalAmount status createdAt userId");

      // Get today's stats
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const todayOrders = await Order.find({
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      });

      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      // Get this week's stats
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const weeklyOrders = await Order.find({
        createdAt: { $gte: startOfWeek }
      });

      const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      // Get top products from orders
      const topProductsAgg = await Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            sales: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
          }
        },
        { $sort: { sales: -1 } },
        { $limit: 5 },
        {
          $project: {
            name: "$_id",
            sales: 1,
            revenue: 1,
            _id: 0
          }
        }
      ]);

      // Get user count for today
      const todayUsers = await User.find({
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      }).countDocuments();

      // Get user count for this week
      const weeklyUsers = await User.find({
        createdAt: { $gte: startOfWeek }
      }).countDocuments();

      // Calculate stats
      const orders = orderStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        canceledOrders: 0
      };

      const products = productStats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0
      };

      const variants = variantStats[0] || {
        totalVariants: 0,
        variantsWithImages: 0
      };

      const variantsWithoutImages = variants.totalVariants - variants.variantsWithImages;

      return c.json({
        success: true,
        data: {
          overview: {
            totalUsers: userCount,
            totalOrders: orders.totalOrders,
            totalRevenue: orders.totalRevenue,
            totalProducts: products.totalProducts,
            totalVariants: variants.totalVariants,
            designTemplates: designTemplateCount
          },
          orders: {
            total: orders.totalOrders,
            pending: orders.pendingOrders,
            processing: orders.processingOrders,
            shipped: orders.shippedOrders,
            delivered: orders.deliveredOrders,
            canceled: orders.canceledOrders
          },
          products: {
            total: products.totalProducts,
            active: products.activeProducts,
            inactive: products.inactiveProducts,
            variants: {
              total: variants.totalVariants,
              withImages: variants.variantsWithImages,
              withoutImages: variantsWithoutImages
            }
          },
          recentOrders,
          revenue: {
            total: orders.totalRevenue,
            average: orders.totalOrders > 0 ? orders.totalRevenue / orders.totalOrders : 0
          },
          topProducts: topProductsAgg,
          dailyStats: {
            todayOrders: todayOrders.length,
            todayRevenue: todayRevenue,
            todayUsers: todayUsers
          },
          weeklyStats: {
            weeklyOrders: weeklyOrders.length,
            weeklyRevenue: weeklyRevenue,
            weeklyUsers: weeklyUsers
          }
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return c.json({ 
        success: false, 
        error: "Failed to fetch dashboard stats",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 500);
    }
  });

export default app;
