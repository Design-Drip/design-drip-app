import React, { use, useState } from "react";
import { TableSavedDesign } from "./components/table-saved-design";
import useGetDesign from "@/features/design/use-get-design";
import { useDeleteDesign } from "@/features/design/use-delete-design";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCartQuery } from "@/features/cart/services/queries";
import { CartKeys } from "@/features/cart/services/queries/keys";

function SavedDesigns() {
  const { data, isLoading } = useGetDesign();
  const designsData = data?.data || [];
  const queryClient = useQueryClient();
  const formatData = designsData.map((item: any) => {
    const previewImages = item.design_images
      ? Object.entries(item.design_images).map(([key, url]) => ({
          view: key,
          url: url as string,
        }))
      : [];
    const productId =
      item.shirt_color_id?.shirt_id?.id || "Unknown Color";
    const colorId = item.shirt_color_id?.id || "Unknown Product";
    return {
      id: item.id,
      colorId: colorId,
      productId: productId,
      previewImages: [previewImages],
      productName:
        item.shirt_color_id?.shirt_id?.name || "Unknown Product",
      designName: item.name,
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
      toast.error("Cannot delete design that is in the cart");
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
      <h1 className="text-2xl font-bold mb-4">Saved Designs</h1>
      <TableSavedDesign
        data={formatData}
        onDelete={handleDelete}
        onConfirmDelete={handleConfirmDelete}
        deleteLoading={deleteDesignMutation.isPending}
        confirmModalOpen={confirmModalOpen}
      />
    </div>
  );
}

export default SavedDesigns;
