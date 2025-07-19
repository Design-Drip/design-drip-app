"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  CheckCircle,
  XCircle,
  Image,
  ImageOff,
  Layers,
  AlertCircle,
  Eye,
} from "lucide-react";

interface ProductStatsCardsProps {
  productStats: {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    totalColors: number;
    colorsWithImages: number;
    colorsWithoutImages: number;
    totalCategories: number;
  };
}

export default function ProductStatsCards({
  productStats,
}: ProductStatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/30">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-500 to-gray-600"></div>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Products</CardTitle>
          <CheckCircle className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {productStats.activeProducts}
          </div>
          <p className="text-xs text-muted-foreground">
            {productStats.totalProducts} total products
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/30">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-500 to-gray-600"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Product Colors</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{productStats.totalColors}</div>
          <p className="text-xs text-muted-foreground">
            {productStats.colorsWithImages} with images
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/30">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-500 to-gray-600"></div>{" "}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Missing Images</CardTitle>
          <ImageOff className="h-4 w-4 " />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {productStats.colorsWithoutImages}
          </div>
          {/* <p className="text-xs text-muted-foreground">Needs attention</p> */}
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/30">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-500 to-gray-600"></div>{" "}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {productStats.totalCategories}
          </div>
          {/* <p className="text-xs text-muted-foreground">Product categories</p> */}
        </CardContent>
      </Card>
    </div>
  );
}
