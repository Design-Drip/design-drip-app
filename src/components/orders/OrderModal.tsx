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
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getProductSizesByColorQuery } from "@/features/products/services/queries";

interface OrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designId: string;
  designName: string;
  mode?: "add" | "edit";
  itemId?: string;
  initialQuantities?: { size: string; quantity: number }[];
  colorId?: string;
}

export function OrderModal({
  open,
  onOpenChange,
  designId,
  designName,
  mode = "add",
  itemId,
  initialQuantities,
  colorId,
}: OrderModalProps) {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const addToCartMutation = useAddToCartMutation();
  const updateCartMutation = useUpdateCartItemMutation();

  const { data: productData, isLoading } = useQuery({
    ...getProductSizesByColorQuery(colorId),
    enabled: !!colorId && open,
  });

  const isPending =
    mode === "add" ? addToCartMutation.isPending : updateCartMutation.isPending;

  // Get available inventory by size
  const availableQuantities: Record<string, number> = {};
  if (productData?.sizes) {
    productData.sizes.forEach((sizeItem) => {
      availableQuantities[sizeItem.size] = sizeItem.quantity;
    });
  }

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
    const maxAvailable = availableQuantities[size] || 0;

    // Limit the quantity to the available stock
    const limitedQuantity = Math.min(quantity < 0 ? 0 : quantity, maxAvailable);

    // If user tries to set more than available, show a toast warning
    if (quantity > maxAvailable) {
      toast.warning(`Only ${maxAvailable} items available for size ${size}`);
    }

    setQuantities((prev) => ({
      ...prev,
      [size]: limitedQuantity,
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

    // Validate quantities against available inventory one more time
    let hasInventoryIssue = false;
    quantityBySize.forEach(({ size, quantity }) => {
      const available = availableQuantities[size] || 0;
      if (quantity > available) {
        toast.error(
          `Not enough inventory for size ${size}. Only ${available} available.`
        );
        hasInventoryIssue = true;
      }
    });

    if (hasInventoryIssue) return;

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

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {FIXED_SIZES.map((size) => {
              const availableQty = availableQuantities[size] || 0;
              const isOutOfStock = availableQty === 0;

              return (
                <div key={size} className="flex items-center gap-4">
                  <Label htmlFor={`size-${size}`} className="w-12">
                    {size}:
                  </Label>
                  <Input
                    id={`size-${size}`}
                    type="number"
                    min="0"
                    max={availableQty}
                    value={quantities[size] || ""}
                    onChange={(e) => handleQuantityChange(size, e.target.value)}
                    className="w-20"
                    disabled={isOutOfStock}
                  />
                  <span className="text-xs text-muted-foreground">
                    {isOutOfStock
                      ? "Out of stock"
                      : `Available: ${availableQty}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || isLoading}>
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
