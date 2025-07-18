"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, XCircle, CheckCircle } from "lucide-react";

interface InventoryCardsProps {
  inventory: {
    totalStock: number;
    lowStockItems: number;
    outOfStockItems: number;
    outOfStockProducts?: Array<{
      productName: string;
      color: string;
      size: string;
      quantity: number;
    }>;
    lowStockProducts?: Array<{
      productName: string;
      color: string;
      size: string;
      quantity: number;
    }>;
  };
}

export default function InventoryCards({ inventory }: InventoryCardsProps) {
  const availableStock = inventory.totalStock - inventory.outOfStockItems;
  const stockHealthPercentage =
    inventory.totalStock > 0
      ? Math.round((availableStock / inventory.totalStock) * 100)
      : 0;

  const getStockHealthColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getStockHealthBadge = (percentage: number) => {
    if (percentage >= 80)
      return { variant: "default" as const, label: "Healthy" };
    if (percentage >= 50)
      return { variant: "secondary" as const, label: "Warning" };
    return { variant: "destructive" as const, label: "Critical" };
  };

  const healthBadge = getStockHealthBadge(stockHealthPercentage);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Overview
          <Badge variant={healthBadge.variant} className="ml-auto">
            {healthBadge.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Total Stock */}
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stock</p>
              <p className="text-2xl font-bold text-blue-900">
                {inventory.totalStock.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600">
                {stockHealthPercentage}% available
              </p>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
            <div className="p-2 bg-yellow-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-900">
                {inventory.lowStockItems.toLocaleString()}
              </p>
              <p className="text-xs text-yellow-600">≤ 10 items remaining</p>
            </div>
          </div>

          {/* Out of Stock Items */}
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
            <div className="p-2 bg-red-100 rounded-full">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-900">
                {inventory.outOfStockItems.toLocaleString()}
              </p>
              <p className="text-xs text-red-600">Needs restocking</p>
            </div>
          </div>
        </div>

        {/* Stock Health Indicator */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Stock Health
            </span>
            <span
              className={`text-sm font-bold ${getStockHealthColor(
                stockHealthPercentage
              )}`}
            >
              {stockHealthPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                stockHealthPercentage >= 80
                  ? "bg-green-500"
                  : stockHealthPercentage >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${stockHealthPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Quick Actions */}
        {inventory.lowStockItems > 0 || inventory.outOfStockItems > 0 ? (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                Action Required
              </span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              {inventory.outOfStockItems > 0 && inventory.lowStockItems > 0
                ? `${inventory.outOfStockItems} items are out of stock and ${inventory.lowStockItems} items are running low.`
                : inventory.outOfStockItems > 0
                ? `${inventory.outOfStockItems} items are out of stock and need immediate restocking.`
                : `${inventory.lowStockItems} items are running low and may need restocking soon.`}
            </p>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                All Good!
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              All items are well-stocked and no immediate action is required.
            </p>
          </div>
        )}

        {/* Out of Stock Products List */}
        {inventory.outOfStockProducts &&
          inventory.outOfStockProducts.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Out of Stock Products
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {inventory.outOfStockProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-red-50 rounded text-xs"
                  >
                    <span className="font-medium text-red-900">
                      {product.productName} - {product.color} ({product.size})
                    </span>
                    <span className="text-red-600 font-bold">0</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Low Stock Products List */}
        {inventory.lowStockProducts &&
          inventory.lowStockProducts.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Low Stock Products
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {inventory.lowStockProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-yellow-50 rounded text-xs"
                  >
                    <span className="font-medium text-yellow-900">
                      {product.productName} - {product.color} ({product.size})
                    </span>
                    <span className="text-yellow-600 font-bold">
                      {product.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
