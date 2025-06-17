"use client";

import React, { useState } from "react";
import { ColorPanel, ProductColor } from "./ColorPanel";
import { ProductImageDisplay } from "./ProductImageDisplay";
import Link from "next/link";

interface ProductColorSelectorProps {
  productId: string;
  colors: ProductColor[];
  defaultImage?: string;
  className?: string;
}

export function ProductColorSelector({
  productId,
  colors,
  defaultImage,
  className = "",
}: ProductColorSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(
    colors.length > 0 ? colors[0] : null
  );

  const handleColorSelect = (color: ProductColor) => {
    setSelectedColor(color);
  };

  return (
    <div className={className}>
      <Link key={productId} href={`/products/${productId}`} className="group">
        <ProductImageDisplay
          colors={colors}
          selectedColor={selectedColor}
          defaultImage={defaultImage}
          className="mb-4 rounded-lg overflow-hidden bg-gray-100"
        />
      </Link>

      <div>
        <h3 className="text-sm font-medium mb-2">Color</h3>
        <ColorPanel
          colors={colors}
          selectedColor={selectedColor}
          onColorSelect={handleColorSelect}
          size="sm"
        />
      </div>
    </div>
  );
}
