"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCartItemCountQuery } from "@/features/cart/services/queries";

export default function CartWidget() {
  const { data: itemCount = 0 } = useQuery(getCartItemCountQuery());

  return (
    <Link href="/cart">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label={`Shopping cart with ${itemCount} items`}
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
          {itemCount}
        </span>
      </Button>
    </Link>
  );
}
