"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Eye, MoreHorizontal } from "lucide-react";

interface RecentOrder {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface RecentOrdersProps {
  recentOrders: RecentOrder[];
}

export default function RecentOrders({ recentOrders = [] }: RecentOrdersProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "default";
      case "shipped":
        return "default";
      case "processing":
        return "secondary";
      case "pending":
        return "secondary";
      case "canceled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Orders
        </CardTitle>
        <CardDescription>Latest orders from your customers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {!recentOrders || recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No recent orders found</p>
            </div>
          ) : (
            (recentOrders || []).slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  ></div>
                  <div>
                    <p className="font-medium">
                      #{order._id?.slice(-8) || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <Badge
                      variant={getStatusVariant(order.status)}
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            View All Orders
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
