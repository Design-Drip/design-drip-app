import { redirect } from "next/navigation";
import { getProductDetails } from "@/app/admin/products/_actions";
import { getColorDetails } from "@/app/admin/products/variants/_actions";
import { ProductImageEditor } from "@/features/admin/components/ProductImageEditor";

export default async function ProductImagesPage({
  params,
  searchParams,
}: {
  params: { productId: string };
  searchParams: { color?: string };
}) {
  const productId = params.productId;
  const colorId = searchParams.color;

  if (!colorId) {
    redirect(`/admin/products/${productId}/variants`);
  }

  const product = await getProductDetails(productId);
  if (!product) {
    redirect("/admin/products");
  }

  const color = await getColorDetails(colorId);
  if (!color) {
    redirect(`/admin/products/${productId}/variants`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Images for {product.name} - {color.name}
        </h2>
        <p className="text-muted-foreground">
          Upload and manage product images for the selected color
        </p>
      </div>

      <ProductImageEditor productId={productId} color={color} />
    </div>
  );
}
