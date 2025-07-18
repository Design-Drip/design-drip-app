// Enhanced interface for dashboard data
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: Array<{
    _id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  // Additional stats
  monthlyRevenue: number;
  monthlyOrders: number;
  monthlyUsers: number;
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  // Enhanced product stats
  productStats: {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    totalVariants: number;
    variantsWithImages: number;
    variantsWithoutImages: number;
  };
  // Additional metrics
  dailyStats: {
    todayOrders: number;
    todayRevenue: number;
    todayUsers: number;
  };
  weeklyStats: {
    weeklyOrders: number;
    weeklyRevenue: number;
    weeklyUsers: number;
  };
  averageOrderValue: number;
  conversionRate: number;
}
