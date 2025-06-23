import Link from "next/link";
import { Heart } from "lucide-react";
import { formatPrice } from "@/lib/price";
import { Card, CardContent, CardHeader } from "../ui/card";
import { ProductColorSelector } from "./ProductColorSelector";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { MouseEventHandler } from "react";

interface ProductCardProps {
  product: any;
  onWishlistChange?: MouseEventHandler<HTMLButtonElement>;
  isInWishlist?: boolean;
  isSignedIn?: boolean;
}

export function ProductCard({
  product,
  onWishlistChange,
  isInWishlist,
  isSignedIn = false,
}: ProductCardProps) {
  return (
    <Card
      key={product._id}
      className="overflow-hidden bg-secondary border-none shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-around relative"
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-2 right-2 z-10 h-8 w-8 rounded-full",
          isInWishlist
            ? "text-red-500 bg-white/80"
            : "text-gray-400 bg-white/80 hover:text-red-500"
        )}
        onClick={onWishlistChange}
        disabled={!isSignedIn}
      >
        <Heart className={cn("h-5 w-5", isInWishlist ? "fill-current" : "")} />
        <span className="sr-only">
          {isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        </span>
      </Button>

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
            ${formatPrice(product.base_price)}
          </p>
        </Link>
      </CardContent>
    </Card>
  );
}
