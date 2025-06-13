import React from "react";
import Link from "next/link";
import { ProductColorSelector } from "./ProductColorSelector";
import { Card, CardContent, CardHeader } from "../ui/card";

interface ProductGridProps {
  products: any[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card className="overflow-hidden bg-secondary border-none shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-around">
          <CardHeader className="p-4">
            <ProductColorSelector
              productId={product._id}
              colors={product.colors || []}
              className="rounded-lg 0 mb-3 aspect-square"
            />
          </CardHeader>
          <CardContent className="p-4">
            <Link
              key={product._id}
              href={`/products/${product._id}`}
              className="group"
            >
              <h3 className="font-medium text-gray-800 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600">
                ${product.base_price.toLocaleString()}
              </p>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
