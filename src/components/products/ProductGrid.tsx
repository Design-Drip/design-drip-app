import React, { startTransition } from "react";
import { ProductCard } from "./ProductCard";
import { useWishlist } from "@/hooks/useWishlist";

interface ProductGridProps {
  products: any[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const { isInWishlist, addItem, removeItem, isSignedIn } = useWishlist();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const inWishlist = isSignedIn ? isInWishlist(product._id) : false;
        return (
          <ProductCard
            key={product._id}
            product={product}
            isInWishlist={inWishlist}
            isSignedIn={isSignedIn}
            onWishlistChange={(e) => {
              e.preventDefault();
              e.stopPropagation();

              startTransition(() => {
                if (inWishlist) {
                  removeItem(product._id);
                } else {
                  addItem(product._id);
                }
              });
            }}
          />
        );
      })}
    </div>
  );
}
