"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

export interface ProductColor {
  id: string;
  color: string;
  color_value: string;
  image: {
    id: string;
    url: string;
    view_side: string;
  } | null;
  sizes?: string[]
}

interface ColorPanelProps {
  colors: ProductColor[];
  selectedColor?: ProductColor | null;
  onColorSelect: (color: ProductColor) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ColorPanel({
  colors,
  selectedColor,
  onColorSelect,
  size = "md",
  className = "",
}: ColorPanelProps) {
  // Set default selected color to the first color if none provided
  const [selected, setSelected] = useState<ProductColor | null>(
    selectedColor || (colors.length > 0 ? colors[0] : null)
  );

  // Size dimensions based on the size prop
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const handleColorClick = (color: ProductColor) => {
    setSelected(color);
    onColorSelect(color);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {colors.map((color) => (
        <button
          key={color.id}
          className={`${
            sizeClasses[size]
          } rounded-full flex items-center justify-center ${
            selected?.id === color.id
              ? "ring-2 ring-red-600 ring-offset-2"
              : "border border-gray-200"
          }`}
          style={{ backgroundColor: color.color_value }}
          onClick={() => handleColorClick(color)}
          title={color.color}
          aria-label={`Select ${color.color} color`}
        >
          {selected?.id === color.id && (
            <Check
              className={`h-4 w-4 ${
                color.color_value === "#ffffff" ||
                color.color_value === "#FFFFFF"
                  ? "text-black"
                  : "text-white"
              }`}
            />
          )}
        </button>
      ))}
    </div>
  );
}
