import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export interface AnalyticsData {
  overview: {
    totalUsers: number;
    usersThisMonth: number;
    userGrowthRate: number;
    totalOrders: number;
    ordersThisMonth: number;
    orderGrowthRate: number;
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowthRate: number;
    totalDesigns: number;
    designsThisMonth: number;
    designGrowthRate: number;
    totalProducts: number;
    activeProducts: number;
    totalColors: number;
  };
  charts: {
    ordersByStatus: { _id: string; count: number }[];
    dailyRevenue: { 
      _id: { year: number; month: number; day: number }; 
      revenue: number; 
      orders: number; 
    }[];
    popularProducts: { 
      _id: string; 
      name: string; 
      orderCount: number; 
      totalRevenue: number; 
    }[];
    userActivity: { 
      _id: { year: number; month: number; day: number }; 
      designs: number; 
    }[];
  };
  recentOrders: {
    _id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: { name: string }[];
  }[];
}

export const useAnalytics = () => {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await client.api.analytics.$get();
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const result = await response.json();
      return result.data as AnalyticsData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
