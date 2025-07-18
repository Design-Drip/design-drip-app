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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{productStats.totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            {productStats.activeProducts} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Colors</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{productStats.totalColors}</div>
          <p className="text-xs text-muted-foreground">
            {productStats.colorsWithImages} with images
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Missing Images</CardTitle>
          <ImageOff className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {productStats.colorsWithoutImages}
          </div>
          <p className="text-xs text-muted-foreground">Needs attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {productStats.totalCategories}
          </div>
          <p className="text-xs text-muted-foreground">Product categories</p>
        </CardContent>
      </Card>
    </div>
  );
}
