"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface StatsCardsProps {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  userGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
}

export default function StatsCards({
  totalUsers,
  totalOrders,
  totalRevenue,
  totalProducts,
  userGrowth,
  orderGrowth,
  revenueGrowth,
}: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (growth < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
    return <TrendingUp className="h-4 w-4 text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardContent>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalUsers.toLocaleString()}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {getGrowthIcon(userGrowth)}
            <span className={`ml-1 ${getGrowthColor(userGrowth)}`}>
              {userGrowth > 0 ? "+" : ""}
              {userGrowth}% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardContent>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalOrders.toLocaleString()}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {getGrowthIcon(orderGrowth)}
            <span className={`ml-1 ${getGrowthColor(orderGrowth)}`}>
              {orderGrowth > 0 ? "+" : ""}
              {orderGrowth}% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardContent>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {getGrowthIcon(revenueGrowth)}
            <span className={`ml-1 ${getGrowthColor(revenueGrowth)}`}>
              {revenueGrowth > 0 ? "+" : ""}
              {revenueGrowth}% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardContent>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalProducts.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Active products</p>
        </CardContent>
      </Card>
    </div>
  );
}
