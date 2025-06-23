"use client";
import { startTransition, Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";
import { getProductsQuery } from "@/features/products/services/queries";
import { ProductCard } from "@/components/products/ProductCard";
import { Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { wishlistItems, isInWishlist, addItem, removeItem, isSignedIn } =
    useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const { data: productsData, isError } = useQuery({
    ...getProductsQuery(wishlistItems),
    enabled: wishlistItems.length > 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (productsData) {
      setProducts(productsData.items);
    }
  }, [productsData]);

  const hasItems = wishlistItems.length > 0;

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-6 text-gray-600">
          We couldn't load your wishlist. Please try again later.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mb-6">
          <Heart className="h-16 w-16 mx-auto text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Your wishlist is empty</h1>
        <p className="mb-6 text-gray-600">
          Find products you love and add them to your wishlist
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <p className="text-gray-600">
          {products.length} {products.length === 1 ? "item" : "items"} saved to
          your wishlist
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
      </Suspense>

      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
