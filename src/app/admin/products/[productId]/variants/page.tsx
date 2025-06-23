import { redirect } from "next/navigation";
import { getProductDetails } from "@/app/admin/products/_actions";
import { checkRole } from "@/lib/roles";
import { ProductVariantsManager } from "@/features/admin/components/ProductVariantsManager";

export default async function ProductVariantsPage({
  params,
}: {
  params: { productId: string };
}) {
  // Verify admin access
  const isAdmin = await checkRole("admin");
  if (!isAdmin) {
    redirect("/");
  }

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
            Manage product variants (sizes and colors)
          </p>
        </div>
      </div>

      <ProductVariantsManager product={product} />
    </div>
  );
}
