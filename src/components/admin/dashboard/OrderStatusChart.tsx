"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart } from "lucide-react";

interface OrderStatus {
  status: string;
  count: number;
  percentage: number;
}

interface OrderStatusChartProps {
  orderStatusDistribution: OrderStatus[];
}

export default function OrderStatusChart({
  orderStatusDistribution,
}: OrderStatusChartProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "text-green-600";
      case "shipped":
        return "text-blue-600";
      case "processing":
        return "text-yellow-600";
      case "pending":
        return "text-orange-600";
      case "canceled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "bg-green-500";
      case "shipped":
        return "bg-blue-500";
      case "processing":
        return "bg-yellow-500";
      case "pending":
        return "bg-orange-500";
      case "canceled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Order Status Distribution
        </CardTitle>
        <CardDescription>Current order status breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orderStatusDistribution.map((item) => (
            <div
              key={item.status}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusBg(item.status)}`}
                ></div>
                <span className="font-medium">
                  {capitalizeStatus(item.status)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24">
                  <Progress value={item.percentage} className="h-2" />
                </div>
                <div className="text-right min-w-[60px]">
                  <span className="font-bold">{item.count}</span>
                  <span
                    className={`text-sm ml-1 ${getStatusColor(item.status)}`}
                  >
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
