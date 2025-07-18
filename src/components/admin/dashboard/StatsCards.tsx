"use client";

import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getGrowthIcon(userGrowth)}
            <span
              className={`ml-2 text-sm font-medium ${getGrowthColor(
                userGrowth
              )}`}
            >
              {userGrowth > 0 ? "+" : ""}
              {userGrowth}% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalOrders.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getGrowthIcon(orderGrowth)}
            <span
              className={`ml-2 text-sm font-medium ${getGrowthColor(
                orderGrowth
              )}`}
            >
              {orderGrowth > 0 ? "+" : ""}
              {orderGrowth}% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-l-4 border-l-purple-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getGrowthIcon(revenueGrowth)}
            <span
              className={`ml-2 text-sm font-medium ${getGrowthColor(
                revenueGrowth
              )}`}
            >
              {revenueGrowth > 0 ? "+" : ""}
              {revenueGrowth}% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-l-4 border-l-orange-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Products
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {totalProducts.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="ml-2 text-sm font-medium text-gray-600">
              Active products
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
