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
  productId?: string;
  name: string;
  sales: number;
  revenue: number;
}

interface TopProductsProps {
  topProducts: TopProduct[];
}

export default function TopProducts({ topProducts = [] }: TopProductsProps) {
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
        <CardDescription>Products with most orders delivered</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(!topProducts || topProducts.length === 0) ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No product data available</p>
            </div>
          ) : (
            <>
              {/* Top Product - Highlighted */}
              {topProducts[0] && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-600">Best Seller</span>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                          1
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{topProducts[0].name}</p>
                          <p className="text-sm text-gray-600">
                            {topProducts[0].sales} units sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-yellow-600">
                          {formatCurrency(topProducts[0].revenue)}
                        </p>
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">
                          🏆 #1
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Products */}
              {topProducts.length > 1 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Other Top Products</span>
                  </div>
                  <div className="space-y-3">
                    {topProducts.slice(1).map((product, index) => (
                      <div
                        key={product.productId || product.name}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                              index === 0
                                ? "bg-gray-400"
                                : index === 1
                                ? "bg-orange-500"
                                : "bg-blue-500"
                            }`}
                          >
                            {index + 2}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">
                              {product.sales} units sold
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(product.revenue)}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            #{index + 2}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
