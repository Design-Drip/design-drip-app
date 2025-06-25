import React, { use } from "react";
import { TableSavedDesign } from "./components/table-saved-design";
import useGetDesign from "@/features/design/use-get-design";
import { useDeleteDesign } from "@/features/design/use-delete-design";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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

    return {
      id: item.id,
      previewImages: [previewImages],
      productName: item.shirt_color_id?.shirt_id?.name || "Unknown Product",
      designName: item.name,
    };
  });
  const deleteDesignMutation = useDeleteDesign();
  const handleDelete = (designId: string) => {
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
        deleteLoading={deleteDesignMutation.isPending}
      />
    </div>
  );
}

export default SavedDesigns;
