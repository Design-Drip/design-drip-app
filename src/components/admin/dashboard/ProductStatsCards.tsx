"use client";

import { Card, CardContent } from "@/components/ui/card";
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
    totalVariants: number;
    variantsWithImages: number;
    variantsWithoutImages: number;
  };
}

export default function ProductStatsCards({
  productStats,
}: ProductStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Products
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {productStats.totalProducts}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">
              {productStats.activeProducts} active
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Variants</p>
              <p className="text-2xl font-bold text-gray-900">
                {productStats.totalVariants}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Layers className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <Image className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-blue-600">
              {productStats.variantsWithImages} with images
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Missing Images
              </p>
              <p className="text-2xl font-bold text-red-600">
                {productStats.variantsWithoutImages}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <ImageOff className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-red-600">Needs attention</span>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Inactive Products
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {productStats.inactiveProducts}
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <XCircle className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <Eye className="h-4 w-4 text-orange-500 mr-1" />
            <span className="text-orange-600">Review needed</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
