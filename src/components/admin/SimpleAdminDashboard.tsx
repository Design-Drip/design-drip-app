"use client";

import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import dashboard components
import DashboardHeader from "./dashboard/DashboardHeader";
import StatsCards from "./dashboard/StatsCards";
import ProductStatsCards from "./dashboard/ProductStatsCards";
import InventoryCards from "./dashboard/InventoryCards";
import TopProducts from "./dashboard/TopProducts";
import RecentOrders from "./dashboard/RecentOrders";
import OrderStatusChart from "./dashboard/OrderStatusChart";
import QuickActions from "./dashboard/QuickActions";
import LoadingState from "./dashboard/LoadingState";
import ErrorState from "./dashboard/ErrorState";
import { DashboardStats } from "./dashboard/DashboardTypes";

export default function SimpleAdminDashboard() {
  // Fetch dashboard data
  const {
    data: stats,
    isLoading,
    refetch,
  } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      const result = await response.json();

      // Use real data from API
      const dashboardData = result.data;

      return {
        totalUsers: dashboardData.overview.totalUsers || 0,
        totalOrders: dashboardData.overview.totalOrders || 0,
        totalRevenue: dashboardData.overview.totalRevenue || 0,
        totalProducts: dashboardData.overview.totalProducts || 0,
        recentOrders: dashboardData.recentOrders || [],
        monthlyRevenue: dashboardData.revenue?.total || 0,
        monthlyOrders: dashboardData.orders?.total || 0,
        monthlyUsers: dashboardData.overview.totalUsers || 0,
        revenueGrowth: 0, // Will be calculated from real data
        orderGrowth: 0, // Will be calculated from real data
        userGrowth: 0, // Will be calculated from real data
        topProducts: dashboardData.topProducts || [],
        orderStatusDistribution: [
          {
            status: "delivered",
            count: dashboardData.orders?.delivered || 0,
            percentage: 0,
          },
          {
            status: "pending",
            count: dashboardData.orders?.pending || 0,
            percentage: 0,
          },
          {
            status: "processing",
            count: dashboardData.orders?.processing || 0,
            percentage: 0,
          },
          {
            status: "shipped",
            count: dashboardData.orders?.shipped || 0,
            percentage: 0,
          },
          {
            status: "canceled",
            count: dashboardData.orders?.canceled || 0,
            percentage: 0,
          },
        ].map((item) => ({
          ...item,
          percentage: Math.round(
            (item.count / (dashboardData.orders?.total || 1)) * 100
          ),
        })),
        // Enhanced product stats
        productStats: {
          totalProducts: dashboardData.products?.total || 0,
          activeProducts: dashboardData.products?.active || 0,
          inactiveProducts: dashboardData.products?.inactive || 0,
          totalColors: dashboardData.products?.colors?.total || 0,
          colorsWithImages: dashboardData.products?.colors?.withImages || 0,
          colorsWithoutImages:
            dashboardData.products?.colors?.withoutImages || 0,
          totalCategories: dashboardData.products?.categories || 0,
        },
        // Additional metrics - using real data
        dailyStats: {
          todayOrders: dashboardData.dailyStats?.todayOrders || 0,
          todayRevenue: dashboardData.dailyStats?.todayRevenue || 0,
          todayUsers: dashboardData.dailyStats?.todayUsers || 0,
        },
        weeklyStats: {
          weeklyOrders: dashboardData.weeklyStats?.weeklyOrders || 0,
          weeklyRevenue: dashboardData.weeklyStats?.weeklyRevenue || 0,
          weeklyUsers: dashboardData.weeklyStats?.weeklyUsers || 0,
        },
        averageOrderValue: dashboardData.revenue?.average || 0,
        conversionRate: 0, // Will be calculated from real data
        // Inventory data
        inventory: dashboardData.products?.inventory || {
          totalStock: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
        },
      };
    },
    refetchInterval: 60000, // Auto refresh every minute
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (!stats) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <DashboardHeader onRefresh={refetch} isLoading={isLoading} />

      {/* Enhanced Stats Cards */}
      <StatsCards
        totalUsers={stats.totalUsers}
        totalOrders={stats.totalOrders}
        totalRevenue={stats.totalRevenue}
        totalProducts={stats.totalProducts}
        userGrowth={stats.userGrowth}
        orderGrowth={stats.orderGrowth}
        revenueGrowth={stats.revenueGrowth}
      />

      {/* Additional Stats Row */}
      <ProductStatsCards productStats={stats.productStats} />

      {/* Inventory Overview */}
      <InventoryCards inventory={stats.inventory} />

      {/* Top Products Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopProducts topProducts={stats.topProducts} />
        <OrderStatusChart
          orderStatusDistribution={stats.orderStatusDistribution}
        />
      </div>

      {/* Detailed Analytics with Tabs
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <RecentOrders recentOrders={stats.recentOrders} />
            <OrderStatusChart
              orderStatusDistribution={stats.orderStatusDistribution}
            />
            <ProductStatsCards productStats={stats.productStats} />
          </div>
          <QuickActions />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <RecentOrders recentOrders={stats.recentOrders} />
          <OrderStatusChart
            orderStatusDistribution={stats.orderStatusDistribution}
          />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <InventoryCards inventory={stats.inventory} />
          <ProductStatsCards productStats={stats.productStats} />
          <TopProducts topProducts={stats.topProducts} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <StatsCards
            totalUsers={stats.totalUsers}
            totalOrders={stats.totalOrders}
            totalRevenue={stats.totalRevenue}
            totalProducts={stats.totalProducts}
            userGrowth={stats.userGrowth}
            orderGrowth={stats.orderGrowth}
            revenueGrowth={stats.revenueGrowth}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <TopProducts topProducts={stats.topProducts} />
            <RecentOrders recentOrders={stats.recentOrders} />
          </div>
        </TabsContent>
      </Tabs> */}
    </div>
  );
}
