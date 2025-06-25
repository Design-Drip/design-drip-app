import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddToCartMutation } from "@/features/cart/services/mutations";
import { toast } from "sonner";
import { FIXED_SIZES } from "@/constants/size";

interface OrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designId: string;
  designName: string;
}

export function OrderModal({
  open,
  onOpenChange,
  designId,
  designName,
}: OrderModalProps) {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const { mutate: addToCart, isPending } = useAddToCartMutation();

  const handleQuantityChange = (size: string, value: string) => {
    const quantity = parseInt(value) || 0;
    setQuantities((prev) => ({
      ...prev,
      [size]: quantity < 0 ? 0 : quantity,
    }));
  };

  const handleAddToCart = () => {
    const quantityBySize = Object.entries(quantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([size, quantity]) => ({ size, quantity }));

    if (quantityBySize.length === 0) {
      toast.error("Please select at least one size and quantity");
      return;
    }

    addToCart(
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Size and Quantity</DialogTitle>
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
          >
            Cancel
          </Button>
          <Button onClick={handleAddToCart} disabled={isPending}>
            {isPending ? "Adding..." : "Add to Cart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
