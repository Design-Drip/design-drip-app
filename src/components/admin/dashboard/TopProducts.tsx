"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Package, Star } from "lucide-react";

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

interface TopProductsProps {
  topProducts: TopProduct[];
}

export default function TopProducts({ topProducts }: TopProductsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Top Selling Products
        </CardTitle>
        <CardDescription>Best performing products this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.length > 0 ? (
            topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                        ? "bg-gray-400"
                        : index === 2
                        ? "bg-orange-500"
                        : "bg-blue-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.sales} sales
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(product.revenue)}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No sales data available</p>
              <p className="text-sm">Orders with items will appear here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
