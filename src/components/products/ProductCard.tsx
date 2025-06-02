import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/data/products";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link href={`/blank_product/${product.id}/${product.slug}`}>
        <div className="relative h-60 w-full overflow-hidden bg-gray-100">
          <Image
            src={product.thumbnail}
            alt={product.name}
            className="object-contain"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/blank_product/${product.id}/${product.slug}`}>
          <h3 className="text-lg font-medium line-clamp-1 hover:text-red-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <Link
              href={`/designer/customize/${product.id}?bt=3&dpid=1`}
              className="text-red-600 hover:text-red-700 text-sm font-medium mr-1"
            >
              {product.printingMethod}
            </Link>
            <span className="text-sm">
              from ${product.price.from.toFixed(2)}* to ${product.price.to.toFixed(2)}*
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {product.colors.slice(0, 8).map((color) => (
              <div
                key={`${color.name}-${color.value}`}
                className="w-5 h-5 rounded-full border border-gray-200"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            {product.colors.length > 8 && (
              <div className="w-5 h-5 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center text-xs">
                +{product.colors.length - 8}
              </div>
            )}
          </div>

          <div>
            <span className="text-sm font-medium">Sizes</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {product.sizes.map((size) => (
                <Badge
                  key={size}
                  variant="outline"
                  className="text-xs bg-transparent hover:bg-gray-100"
                >
                  {size}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
