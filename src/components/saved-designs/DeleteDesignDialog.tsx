"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteDesign } from "@/features/design/use-delete-design";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Design {
  id?: string;
  _id?: string;
  name: string;
  version: string;
  createdAt: string;
  design_images: Record<string, string>;
  quote_id?: any;
}

interface DeleteDesignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  design: Design | null;
}

export const DeleteDesignDialog = ({
  open,
  onOpenChange,
  design,
}: DeleteDesignDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteDesignMutation = useDeleteDesign();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!design) return;

    const designId = design.id || design._id;
    if (!designId) {
      toast.error("Invalid design ID");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDesignMutation.mutateAsync(designId);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["design"] });
      
      toast.success("Design deleted successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete design");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Design</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{design?.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
