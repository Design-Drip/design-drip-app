import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAddToCartMutation,
  useUpdateCartItemMutation,
} from "@/features/cart/services/mutations";
import { toast } from "sonner";
import { FIXED_SIZES } from "@/constants/size";

interface OrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designId: string;
  designName: string;
  mode?: "add" | "edit";
  itemId?: string;
  initialQuantities?: { size: string; quantity: number }[];
}

export function OrderModal({
  open,
  onOpenChange,
  designId,
  designName,
  mode = "add",
  itemId,
  initialQuantities,
}: OrderModalProps) {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const addToCartMutation = useAddToCartMutation();
  const updateCartMutation = useUpdateCartItemMutation();

  const isPending =
    mode === "add" ? addToCartMutation.isPending : updateCartMutation.isPending;

  // Initialize quantities from initialQuantities if provided (for edit mode)
  useEffect(() => {
    if (initialQuantities && open) {
      const quantityMap = initialQuantities.reduce((acc, curr) => {
        acc[curr.size] = curr.quantity;
        return acc;
      }, {} as { [key: string]: number });
      setQuantities(quantityMap);
    } else if (open) {
      // Reset quantities when modal opens in add mode
      setQuantities({});
    }
  }, [initialQuantities, open]);

  const handleQuantityChange = (size: string, value: string) => {
    const quantity = parseInt(value) || 0;
    setQuantities((prev) => ({
      ...prev,
      [size]: quantity < 0 ? 0 : quantity,
    }));
  };

  const handleSubmit = () => {
    const quantityBySize = Object.entries(quantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([size, quantity]) => ({ size, quantity }));

    if (quantityBySize.length === 0) {
      toast.error("Please select at least one size and quantity");
      return;
    }

    if (mode === "add") {
      addToCartMutation.mutate(
        { designId, quantityBySize },
        {
          onSuccess: () => {
            toast.success(`${designName} added to your cart`);
            onOpenChange(false);
            setQuantities({});
          },
          onError: (error) => {
            toast.error(error.message || "Failed to add item to cart");
          },
        }
      );
    } else if (mode === "edit" && itemId) {
      updateCartMutation.mutate(
        { itemId, payload: { quantityBySize } },
        {
          onSuccess: () => {
            toast.success(`Cart updated successfully`);
            onOpenChange(false);
          },
          onError: (error) => {
            toast.error(error.message || "Failed to update cart");
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add to Cart" : "Update Cart Item"}
          </DialogTitle>
          <DialogDescription>
            {designName} - Select sizes and quantities
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {FIXED_SIZES.map((size) => (
            <div key={size} className="flex items-center gap-4">
              <Label htmlFor={`size-${size}`} className="w-12">
                {size}:
              </Label>
              <Input
                id={`size-${size}`}
                type="number"
                min="0"
                value={quantities[size] || ""}
                onChange={(e) => handleQuantityChange(size, e.target.value)}
                className="w-20"
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending
              ? mode === "add"
                ? "Adding..."
                : "Updating..."
              : mode === "add"
              ? "Add to Cart"
              : "Update Cart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
