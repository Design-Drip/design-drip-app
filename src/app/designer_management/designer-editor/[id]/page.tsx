"use client";
import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DesignerEditor } from "../Editor";

export default function DesignerEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.id as string;
  const colorId = searchParams.get("colorId");
  const quoteId = searchParams.get("quoteId");
  const designId = searchParams.get("designId");
  const fromQuote = searchParams.get("fromQuote") === "true";
  const [product, setProduct] = useState<any>(null);
  const [designDetail, setDesignDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
      if (designId) {
        fetchDesignDetail(designId);
      }
    }
    // eslint-disable-next-line
  }, [productId, designId]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    const res = await fetch(`/api/products/${productId}`);
    const data = await res.json();
    setProduct(data);
    setLoading(false);
  };

  const fetchDesignDetail = async (designId: string) => {
    try {
      const res = await fetch(`/api/design/${designId}`);
      const data = await res.json();
      if (data.success) {
        setDesignDetail(data.data);
      }
    } catch (error) {
      console.error("Error fetching design detail:", error);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-red-600 mb-4" />
        <p>Loading product design...</p>
      </div>
    );
  }

  const colors = product.colors || [];
  const productColor = colorId && colorId !== "null" ? colors.find((c: any) => c.id === colorId) : colors[0];
  const productColorId = productColor?.id || "";
  const images = productColor?.images || [];

  console.log("Debug info:", {
    productId,
    colorId,
    designId,
    quoteId,
    colors: colors.length,
    selectedColor: productColor?.color,
    imagesCount: images.length,
    productColorId,
    designDetail: !!designDetail
  });

  return (
    <DesignerEditor
      images={images}
      productColorId={productColorId}
      designDetail={designDetail}
      quoteId={quoteId || undefined}
    />
  );
} 