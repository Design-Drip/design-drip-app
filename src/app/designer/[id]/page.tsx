"use client";
import { getProductColors } from "@/app/admin/products/images/_actions";
import { Editor } from "@/components/editor/Editor";
import { Button } from "@/components/ui/button";
import { getProductDetailQuery } from "@/features/products/services/queries";
import { products } from "@/lib/data/products";
import { auth } from "@clerk/nextjs/server";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function EditDesignPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { colorId: string; designId?: string };
}) {

  
  const { id } = params;
  const { colorId, designId } = searchParams;
  const isEditDesign = designId !== undefined && designId !== "";
  const [designDetail, setDesignDetail] = useState<any>({});
  const [isLoadingDesignDetail, setIsLoadingDesignDetail] = useState(false);
  
  // Debug log to check designDetail

  
  const { data, isLoading, isError } = useQuery(getProductDetailQuery(id));
  const router = useRouter();

  // Fetch design detail using fetch directly like designer editor
  useEffect(() => {
    if (isEditDesign && designId) {
      fetchDesignDetail(designId);
    }
  }, [isEditDesign, designId]);

  const fetchDesignDetail = async (designId: string) => {
    try {
      setIsLoadingDesignDetail(true);
      console.log("Fetching design detail for ID:", designId);
      const res = await fetch(`/api/design/${designId}`);
      const data = await res.json();
      console.log("Design detail response:", data);
      if (data.success) {
        setDesignDetail(data.data || {});
      }
    } catch (error) {
      console.error("Error fetching design detail:", error);
    } finally {
      setIsLoadingDesignDetail(false);
    }
  };

  const colors = data?.colors || [];

  const productColor = colorId
    ? colors.find((color) => color.id === colorId)
    : undefined;

  const productColorId = productColor?.id || "";

  const images = productColor?.images || [];

  if (isLoading || isLoadingDesignDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-red-600 mb-4" />
          <p>Loading product design...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <p className="text-red-600 mb-4">Failed to load product design.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }
  if (!productColor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <p className="text-red-600 mb-4">Failed to load product color.</p>
        </div>
      </div>
    );
  }
  if (images.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <p className="text-red-600 mb-4">
            No images available for this product.
          </p>
        </div>
      </div>
    );
  }
  return (
    <Editor
      images={images}
      productColorId={productColorId}
      designDetail={designDetail}
    />
  );
}

export default EditDesignPage;
