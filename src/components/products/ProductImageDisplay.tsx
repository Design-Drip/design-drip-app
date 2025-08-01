"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ProductColor } from "./ColorPanel";

interface ProductImageDisplayProps {
  colors: ProductColor[];
  selectedColor?: ProductColor | null;
  defaultImage?: string;
  className?: string;
}

export function ProductImageDisplay({
  colors,
  selectedColor,
  defaultImage = "/shirt-placeholder.webp",
  className = "",
}: ProductImageDisplayProps) {
  // Use the first color with an image as default if no selected color
  const [currentImage, setCurrentImage] = useState<string>(
    selectedColor?.image?.url ||
      colors.find((c) => c.image?.url)?.image?.url ||
      defaultImage
  );

  // Update image when selected color changes
  useEffect(() => {
    if (selectedColor?.image?.url) {
      setCurrentImage(selectedColor.image.url);
    } else if (!selectedColor && colors.length > 0) {
      // If no color selected but colors exist, use the first color with an image
      const firstColorWithImage = colors.find((c) => c.image?.url);
      setCurrentImage(firstColorWithImage?.image?.url || defaultImage);
    } else {
      setCurrentImage(defaultImage);
    }
  }, [selectedColor, colors, defaultImage]);

  return (
    <div className={`relative aspect-square ${className}`}>
      <Image
        src={currentImage}
        alt="Product image"
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-contain"
        unoptimized
      />
    </div>
  );
}
