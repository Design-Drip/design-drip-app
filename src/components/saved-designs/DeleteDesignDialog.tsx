import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

type DeleteDesignDialogProps = {
  itemId: string;
  onConfirmDelete: (id: string) => void;
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DeleteDesignDialog = ({
  itemId,
  onConfirmDelete,
  loading,
  open,
  onOpenChange,
}: DeleteDesignDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            design and remove your design from your cart.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onConfirmDelete(itemId);
              onOpenChange(false);
            }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDesignDialog;
