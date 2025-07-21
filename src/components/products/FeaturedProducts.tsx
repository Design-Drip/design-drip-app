'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductGrid } from "./ProductGrid";
import { getProductsQuery } from "@/features/products/services/queries";
import { useQuery } from "@tanstack/react-query";

export function FeaturedProducts() {
  const { data: productsData } = useQuery(getProductsQuery());

  return (
    <section className="py-20 w-full">
      <div className="max-w-none mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
        {productsData?.items && <ProductGrid products={productsData.items} />}
        <div className="text-center mt-8">
          <Button asChild size="lg">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}