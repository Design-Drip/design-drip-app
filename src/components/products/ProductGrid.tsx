import React from "react";
import Link from "next/link";
import Image from "next/image";

interface ProductGridProps {
  products: any[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="group"
        >
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
            {/* Add a loading placeholder and error handling */}
            <Image
              src={"/placeholder-tshirt.png"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div>
            <h3 className="font-medium text-gray-800 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600">
              ${product.base_price.toFixed(2)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
