import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getProductDetails } from "@/app/admin/products/_actions";
import { ProductInventoryManager } from "@/features/admin/components/ProductInventoryManager";

export default async function ProductInventoryPage({
  params,
}: {
  params: { productId: string };
}) {
  const productId = params.productId;
  const product = await getProductDetails(productId);

  if (!product) {
    redirect("/admin/products");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{product.name}</h2>
          <p className="text-muted-foreground">
            Manage product inventory (stock levels)
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/products/${productId}/variants`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Product Variants
          </Link>
        </Button>
      </div>

      <ProductInventoryManager product={product} />
    </div>
  );
}
