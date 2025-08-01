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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/30">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-600"></div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Users
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full shadow-sm">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {getGrowthIcon(userGrowth)}
            <span className={`ml-2 font-medium ${getGrowthColor(userGrowth)}`}>
              {userGrowth > 0 ? "+" : ""}
              {userGrowth}% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50/30">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-green-600"></div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {totalOrders.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full shadow-sm">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {getGrowthIcon(orderGrowth)}
            <span className={`ml-2 font-medium ${getGrowthColor(orderGrowth)}`}>
              {orderGrowth > 0 ? "+" : ""}
              {orderGrowth}% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-orange-50/30">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-orange-600"></div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full shadow-sm">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {getGrowthIcon(revenueGrowth)}
            <span
              className={`ml-2 font-medium ${getGrowthColor(revenueGrowth)}`}
            >
              {revenueGrowth > 0 ? "+" : ""}
              {revenueGrowth}% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/30">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-purple-600"></div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Products
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {totalProducts.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full shadow-sm">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          {/* <div className="mt-4 text-sm text-gray-600 font-medium">
            Active products
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
