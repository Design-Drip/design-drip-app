import { Hono } from "hono";
import { Order } from "@/models/order";
import { Shirt, ShirtSizeVariant, ShirtColor, Category } from "@/models/product";
import { DesignTemplate } from "@/models/design-template";
import { clerkClient } from "@clerk/nextjs/server";

const app = new Hono()
  .get("/", async (c) => {
    try {
      console.log("=== Dashboard API - Getting Real Data ===");
      
      // Get actual product counts
      const totalProducts = await Shirt.countDocuments();
      const activeProducts = await Shirt.countDocuments({ isActive: true });
      const inactiveProducts = await Shirt.countDocuments({ isActive: false });
      
      // Get order statistics
      const totalOrders = await Order.countDocuments();
      const ordersByStatus = await Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" }
          }
        }
      ]);
      
      // Calculate order stats - tính revenue theo logic mới
      let totalRevenue = 0;
      let pendingOrders = 0;
      let processingOrders = 0;
      let shippingOrders = 0;
      let shippedOrders = 0;
      let deliveredOrders = 0;
      let canceledOrders = 0;
      
      ordersByStatus.forEach(item => {
        // Logic mới: cộng tiền khi processing, shipping, shipped; trừ tiền khi canceled
        if (item._id === 'processing' || item._id === 'shipping' || item._id === 'shipped') {
          totalRevenue += item.totalRevenue;
        } 
        
        switch(item._id) {
          case 'pending': pendingOrders = item.count; break;
          case 'processing': processingOrders = item.count; break;
          case 'shipping': shippingOrders = item.count; break;
          case 'shipped': shippedOrders = item.count; break;
          case 'delivered': deliveredOrders = item.count; break;
          case 'canceled': canceledOrders = item.count; break;
        }
      });
      
      // Get users from Clerk (như admin users page)
      const client = await clerkClient();
      const clerkUsersResponse = await client.users.getUserList({ limit: 1000 });
      const totalUsers = clerkUsersResponse.totalCount;
      
      // Get variants - chỉ đếm colors, không đếm size variants
      const totalColors = await ShirtColor.countDocuments();
      
      // Get categories count
      const totalCategories = await Category.countDocuments();
      const designTemplateCount = await DesignTemplate.countDocuments();
      
      // Get inventory statistics với chi tiết products
      const inventoryStats = await ShirtSizeVariant.aggregate([
        {
          $group: {
            _id: null,
            totalStock: { $sum: "$quantity" },
            lowStockItems: { $sum: { $cond: [{ $lte: ["$quantity", 10] }, 1, 0] } },
            outOfStockItems: { $sum: { $cond: [{ $eq: ["$quantity", 0] }, 1, 0] } }
          }
        }
      ]);
      
      const inventory = inventoryStats[0] || {
        totalStock: 0,
        lowStockItems: 0,
        outOfStockItems: 0
      };

      // Get detailed out of stock products
      const outOfStockProducts = await ShirtSizeVariant.aggregate([
        {
          $match: { quantity: 0 }
        },
        {
          $lookup: {
            from: "shirtcolors",
            localField: "shirtColor",
            foreignField: "_id",
            as: "colorInfo"
          }
        },
        {
          $lookup: {
            from: "shirts",
            localField: "colorInfo.shirt_id",
            foreignField: "_id",
            as: "shirtInfo"
          }
        },
        {
          $project: {
            size: 1,
            productName: { $arrayElemAt: ["$shirtInfo.name", 0] },
            color: { $arrayElemAt: ["$colorInfo.color", 0] },
            quantity: 1
          }
        },
        { $limit: 10 }
      ]);

      // Get detailed low stock products
      const lowStockProducts = await ShirtSizeVariant.aggregate([
        {
          $match: { 
            quantity: { $gt: 0, $lte: 10 }
          }
        },
        {
          $lookup: {
            from: "shirtcolors",
            localField: "shirtColor",
            foreignField: "_id",
            as: "colorInfo"
          }
        },
        {
          $lookup: {
            from: "shirts",
            localField: "colorInfo.shirt_id",
            foreignField: "_id",
            as: "shirtInfo"
          }
        },
        {
          $project: {
            size: 1,
            quantity: 1,
            productName: { $arrayElemAt: ["$shirtInfo.name", 0] },
            color: { $arrayElemAt: ["$colorInfo.color", 0] }
          }
        },
        { $sort: { quantity: 1 } },
        { $limit: 10 }
      ]);
      
      // Get colors with images
      const colorsWithImages = await ShirtColor.countDocuments({
        images: { $exists: true, $ne: [], $not: { $size: 0 } }
      });
      
      // Get recent orders
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("_id totalAmount status createdAt userId");

      // Get today's stats
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const todayOrders = await Order.find({
        createdAt: { $gte: startOfDay, $lt: endOfDay },
        status: "delivered"
      });
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      // Get this week's stats
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const weeklyOrders = await Order.find({
        createdAt: { $gte: startOfWeek },
        status: "delivered"
      });
      const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      // Get top products - lấy từ delivered orders theo product thực sự
      const topProductsAgg = await Order.aggregate([
        {
          $match: { status: "delivered" } // Chỉ lấy orders đã delivered
        },
        { $unwind: "$items" },
        { $unwind: "$items.sizes" }, // Unwind sizes để đếm quantity
        {
          $lookup: {
            from: "designs", // Lookup design
            localField: "items.designId",
            foreignField: "_id",
            as: "designInfo"
          }
        },
        {
          $unwind: "$designInfo" // Unwind để access được fields
        },
        {
          $lookup: {
            from: "shirtcolors", // Lookup shirt color
            localField: "designInfo.shirt_color_id",
            foreignField: "_id",
            as: "colorInfo"
          }
        },
        {
          $unwind: "$colorInfo" // Unwind để access được fields
        },
        {
          $lookup: {
            from: "shirts", // Lookup product thực sự từ shirt_id trong color
            localField: "colorInfo.shirt_id",
            foreignField: "_id",
            as: "productInfo"
          }
        },
        {
          $unwind: "$productInfo" // Unwind để access được fields
        },
        {
          $group: {
            _id: "$productInfo._id", // Group theo product ID thực sự
            productName: { $first: "$productInfo.name" },
            sales: { $sum: "$items.sizes.quantity" }, // Tổng quantity của tất cả sizes
            revenue: { $sum: { $multiply: ["$items.sizes.quantity", "$items.sizes.pricePerUnit"] } }
          }
        },
        { $sort: { sales: -1 } },
        { $limit: 5 },
        {
          $project: {
            productId: { $toString: "$_id" },
            name: "$productName",
            sales: 1,
            revenue: 1,
            _id: 0
          }
        }
      ]);

      // Get user counts for today and week (sử dụng Clerk)
      const todayUsersResponse = await client.users.getUserList({ 
        limit: 1000,
        // Filter by creation date không được support trực tiếp trong Clerk
      });
      const todayUsers = 0; // Tạm thời set 0 vì Clerk không support filter by date

      const weeklyUsers = 0; // Tạm thời set 0 vì Clerk không support filter by date

      console.log("Real data:", {
        products: { total: totalProducts, active: activeProducts, inactive: inactiveProducts },
        orders: { total: totalOrders, revenue: totalRevenue },
        colors: totalColors,
        categories: totalCategories,
        users: totalUsers,
        inventory: inventory
      });

      return c.json({
        success: true,
        data: {
          overview: {
            totalUsers: totalUsers,
            totalOrders: totalOrders,
            totalRevenue: totalRevenue,
            totalProducts: totalProducts,
            totalColors: totalColors,
            totalCategories: totalCategories,
            designTemplates: designTemplateCount
          },
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            processing: processingOrders,
            shipped: shippedOrders,
            delivered: deliveredOrders,
            canceled: canceledOrders
          },
          products: {
            total: totalProducts,
            active: activeProducts,
            inactive: inactiveProducts,
            colors: {
              total: totalColors,
              withImages: colorsWithImages,
              withoutImages: totalColors - colorsWithImages
            },
            categories: totalCategories,
            inventory: {
              ...inventory,
              outOfStockProducts,
              lowStockProducts
            }
          },
          recentOrders,
          revenue: {
            total: totalRevenue,
            average: (processingOrders + shippingOrders + shippedOrders) > 0 ? totalRevenue / (processingOrders + shippingOrders + shippedOrders) : 0
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
