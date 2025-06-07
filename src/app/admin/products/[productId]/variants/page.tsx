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
        <div>
          <a
            href="/admin/products"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Back to Products
          </a>
        </div>
      </div>

      <ProductVariantsManager product={product} />
    </div>
  );
}
