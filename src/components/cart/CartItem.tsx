"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { formatPrice } from "@/lib/price";
import { OrderModal } from "@/components/order/OrderModal";

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  quantity: number;
  size: string;
  color: string;
  selected: boolean;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onToggleSelect: (id: string) => void;
  designId?: string; // Added designId for OrderModal
}

export default function CartItem({
  id,
  name,
  price,
  originalPrice,
  image,
  quantity,
  size,
  color,
  selected,
  onUpdateQuantity,
  onRemove,
  onToggleSelect,
  designId,
}: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Parse the size string to extract sizes and quantities
  const sizeParts = size.split(",").map((part) => part.trim());
  const formattedSizes = sizeParts.map((part) => {
    // Match pattern like "S (x1)" or "M (2)"
    const match = part.match(/([A-Z]+)\s*\(?(?:x)?(\d+)\)?/);
    if (match) {
      return {
        size: match[1],
        quantity: parseInt(match[2], 10),
      };
    }
    return { size: part, quantity: 1 };
  });

  // Calculate the total price based on individual sizes and quantities
  const totalPrice = price * quantity;

  // Format the initial quantities for OrderModal
  const initialQuantities = formattedSizes.map((item) => ({
    size: item.size,
    quantity: item.quantity,
  }));

  // Get design name from product name (assuming format: "designName - productName")
  const designName = name.includes(" - ") ? name.split(" - ")[0] : name;

  return (
    <>
      <Card className="flex items-start gap-4 p-4 rounded-xl hover:shadow-md transition-shadow">
        <div className="flex items-center pt-2">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(id)}
            className="w-5 h-5"
            disabled={isUpdating}
          />
        </div>

        {/* Product Image */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
          <Image
            src={image || "/shirt-placeholder.webp"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2">
                {name}
              </h3>

              {/* Product Attributes */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <p>Color:</p>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {color}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <p>Size:</p>
                {formattedSizes.map((item, index) => (
                  <span
                    key={`${item.size}-${index}`}
                    className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                  >
                    {item.size} (x{item.quantity})
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditModalOpen(true)}
                className="text-gray-400 hover:text-blue-500 p-1 h-auto"
                disabled={isUpdating || !designId}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(id)}
                className="text-gray-400 hover:text-red-500 p-1 h-auto"
                disabled={isUpdating}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Unit Price */}
          <div className="mt-2 text-xs text-gray-500">
            {formatPrice(price)} each
          </div>

          {/* Total Price */}
          <div className="flex justify-end items-center mt-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-gray-900">
                {formatPrice(totalPrice)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(originalPrice * quantity)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {designId && (
        <OrderModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          designId={designId}
          designName={designName}
          mode="edit"
          itemId={id}
          initialQuantities={initialQuantities}
        />
      )}
    </>
  );
}
