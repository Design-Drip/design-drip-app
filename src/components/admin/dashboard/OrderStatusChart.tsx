"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface OrderStatusChartProps {
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export default function OrderStatusChart({
  orderStatusDistribution,
}: OrderStatusChartProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          color: "#eab308", // yellow-500
          textColor: "text-yellow-700",
          bgColor: "bg-yellow-50",
          icon: Clock,
        };
      case "processing":
        return {
          label: "Processing",
          color: "#3b82f6", // blue-500
          textColor: "text-blue-700",
          bgColor: "bg-blue-50",
          icon: Package,
        };
      case "shipped":
        return {
          label: "Shipped",
          color: "#a855f7", // purple-500
          textColor: "text-purple-700",
          bgColor: "bg-purple-50",
          icon: Truck,
        };
      case "delivered":
        return {
          label: "Delivered",
          color: "#22c55e", // green-500
          textColor: "text-green-700",
          bgColor: "bg-green-50",
          icon: CheckCircle,
        };
      case "canceled":
        return {
          label: "Canceled",
          color: "#ef4444", // red-500
          textColor: "text-red-700",
          bgColor: "bg-red-50",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          color: "#6b7280", // gray-500
          textColor: "text-gray-700",
          bgColor: "bg-gray-50",
          icon: Package,
        };
    }
  };

  // Tính tổng để làm biểu đồ tròn
  const totalOrders = orderStatusDistribution.reduce(
    (sum, item) => sum + item.count,
    0
  );

  // Sắp xếp theo count giảm dần
  const sortedData = [...orderStatusDistribution].sort(
    (a, b) => b.count - a.count
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Order Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-6">
          {/* Biểu đồ tròn CSS */}
          <div className="relative w-48 h-48">
            <svg
              className="w-48 h-48 transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="10"
              />
              {(() => {
                let offset = 0;
                return sortedData.map((item, index) => {
                  const config = getStatusConfig(item.status);
                  const percentage =
                    totalOrders > 0 ? (item.count / totalOrders) * 100 : 0;
                  const circumference = 2 * Math.PI * 45;
                  const strokeDasharray = `${
                    (percentage / 100) * circumference
                  } ${circumference}`;
                  const strokeDashoffset = (-offset * circumference) / 100;

                  offset += percentage;

                  return (
                    <circle
                      key={item.status}
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={config.color}
                      strokeWidth="10"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300 hover:stroke-opacity-80"
                    />
                  );
                });
              })()}
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {totalOrders}
                </div>
                <div className="text-sm text-gray-500">Total Orders</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {sortedData.map((item) => {
            const config = getStatusConfig(item.status);
            const Icon = config.icon;

            return (
              <div
                key={item.status}
                className={`flex items-center justify-between p-3 rounded-lg ${config.bgColor} hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <Icon className={`h-4 w-4 ${config.textColor}`} />
                  <span className={`font-medium ${config.textColor}`}>
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${config.textColor}`}>
                    {item.count}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {item.percentage}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {sortedData.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Most Common Status:</span>
              <span className="font-medium text-gray-900">
                {getStatusConfig(sortedData[0]?.status || "").label} (
                {sortedData[0]?.percentage || 0}%)
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
