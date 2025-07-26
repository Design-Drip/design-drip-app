"use client";

import React, { useState } from "react";
import { TableSavedDesign } from "./components/table-saved-design";
import useGetDesign from "@/features/design/use-get-design";
import { useDeleteDesign } from "@/features/design/use-delete-design";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCartQuery } from "@/features/cart/services/queries";
import { CartKeys } from "@/features/cart/services/queries/keys";

type SavedDesignsProps = {
  displayActionMenu?: boolean;
};

function SavedDesigns({ displayActionMenu = false }: SavedDesignsProps) {
  const { data, isLoading } = useGetDesign();
  const designsData = data?.data || [];
  const queryClient = useQueryClient();
  const formatData = designsData.map((item: any) => {
    console.log("Design item:", item); // Debug log
    console.log("Design createdAt fields:", {
      created_at: item.created_at,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      _id: item._id,
      version: item.version,
    }); // Debug log for timestamp fields

    const previewImages = item.design_images
      ? Object.entries(item.design_images).map(([key, url]) => ({
          view: key,
          url: url as string,
        }))
      : [];
    const productId = item.shirt_color_id?.shirt_id?.id || "Unknown Product";
    const colorId = item.shirt_color_id?.id || "Unknown Color";

    // Check if this design has a parent (is a version)
    const isVersion = !!item.parent_design_id;

    const parentDesign: any = isVersion
      ? designsData.find((d: any) => d.id === item.parent_design_id)
      : null;

    return {
      id: item.id,
      colorId: colorId,
      productId: productId,
      previewImages: [previewImages],
      productName: item.shirt_color_id?.shirt_id?.name || "Unknown Product",
      designName: item.name,
      isVersion,
      version: item.version || "original", // Add version field
      parentDesignName: parentDesign?.name || null,
      createdAt:
        item.createdAt ||
        item.created_at ||
        item.updatedAt ||
        new Date().toISOString(),
    };
  });
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const { data: cartData } = useQuery(getCartQuery());
  const cartItems = cartData?.items || [];
  const existingDesigns = formatData.find((design) => {
    return cartItems.some((item) => item.designId === design.id);
  });

  const deleteDesignMutation = useDeleteDesign();
  const handleDelete = (designId: string) => {
    if (existingDesigns?.id === designId) {
      setConfirmModalOpen(true);
    } else {
      deleteDesignMutation.mutate(designId, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["design"],
          });
          queryClient.invalidateQueries({
            queryKey: [CartKeys.GetCartQuery],
          });
          queryClient.invalidateQueries({
            queryKey: [CartKeys.GetCartItemCountQuery],
          });
          toast.success("Design deleted successfully");
        },
        onError: (error) => {
          toast.error(`Failed to delete design`);
        },
      });
    }
  };
  const handleConfirmDelete = (designId: string) => {
    deleteDesignMutation.mutate(designId, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["design"],
        });
        queryClient.invalidateQueries({
          queryKey: [CartKeys.GetCartQuery],
        });
        queryClient.invalidateQueries({
          queryKey: [CartKeys.GetCartItemCountQuery],
        });
        toast.success("Design deleted successfully");
      },
      onError: (error) => {
        toast.error(`Failed to delete design`);
      },
    });
  };
  if (isLoading) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-red-600 mb-4" />
          <p>Loading product design...</p>
        </div>
      </div>
    );
  }
  return (
    <div>
      <h2 className="text-xl font-semibold">Saved Designs</h2>
      <TableSavedDesign
        data={formatData}
        onDelete={handleDelete}
        onConfirmDelete={handleConfirmDelete}
        deleteLoading={deleteDesignMutation.isPending}
        confirmModalOpen={confirmModalOpen}
        onConfirmModalOpen={setConfirmModalOpen}
        displayActionMenu={displayActionMenu}
      />
    </div>
  );
}

export default SavedDesigns;
