"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getProductDetailQuery } from "@/features/products/services/queries";
import { Heart, Plus, Minus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/price";
import { FIXED_SIZES } from "@/constants/size";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";
import { SignInButton } from "@clerk/nextjs";

interface ProductDetailPageProps {
  params: { id: string; slug: string };
}

export default function ProductDetailPage({
  params: { id },
}: ProductDetailPageProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery(getProductDetailQuery(id));
  const {
    isInWishlist,
    addItem,
    removeItem,
    isLoading: isWishlistLoading,
    isSignedIn,
  } = useWishlist();

  const uniqueSizes = Array.from(new Set(data?.sizes.map((size) => size.size)));

  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState(FIXED_SIZES[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedView, setSelectedView] = useState("front");
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "description"
  );

  const inWishlist = useMemo(() => {
    return isSignedIn && id ? isInWishlist(id) : false;
  }, [id, isInWishlist, isSignedIn]);

  const handleWishlistToggle = () => {
    if (!id || !isSignedIn) return;

    if (inWishlist) {
      removeItem(id);
    } else {
      addItem(id);
    }
  };

  // Get images for the selected color
  const currentColor =
    data?.colors && data.colors.length > 0
      ? data.colors.find((c) => c.color_value === selectedColor) ||
      data.colors[0]
      : undefined;

  // Filter images for the current view
  const getImageForView = (viewSide: string) => {
    return currentColor?.images.find((img) => img.view_side === viewSide);
  };

  const primaryImage = getImageForView(selectedView)?.url;

  // Get all available view images
  const productViews = ["front", "back", "left", "right"]
    .map((view) => ({
      id: view,
      label: view.charAt(0).toUpperCase() + view.slice(1),
      imageUrl: getImageForView(view)?.url || "",
    }))
    .filter((view) => view.imageUrl !== "");

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const createNewDesign = () => {
    const colorId = currentColor?.id || "";
    router.push(`/designer/${data?.product.id}?colorId=${colorId}`);
  };

  const getMaxAvailableQuantity = () => {
    if (!currentColor) return 999;

    const sizeVariant = data?.sizes.find(
      (s) => s.size === selectedSize && s.shirtColor === currentColor.id
    );

    return sizeVariant?.quantity || 0;
  };

  // Add a useEffect to reset quantity if it's more than available
  useEffect(() => {
    const maxQuantity = getMaxAvailableQuantity();
    if (quantity > maxQuantity && maxQuantity > 0) {
      setQuantity(maxQuantity);
    } else if (maxQuantity === 0 && selectedSize) {
      // Find first available size if current size is out of stock
      const firstAvailableSize = uniqueSizes.find((size) => {
        const variant = data?.sizes.find(
          (s) =>
            s.size === size &&
            (!currentColor || s.shirtColor === currentColor.id)
        );
        return variant && variant.quantity > 0;
      });

      if (firstAvailableSize) {
        setSelectedSize(firstAvailableSize);
      }
    }
  }, [selectedSize, selectedColor]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-red-600 mb-4" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <p className="text-red-600 mb-4">Failed to load product details.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images Section */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-4">
              {/* Main Product Image */}
              <div className="relative h-[400px] w-full bg-gray-50 mb-4">
                {primaryImage ? (
                  <Image
                    src={primaryImage}
                    alt={`${data.product.name} - ${selectedView} view`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
              </div>

              {/* Product View Options */}
              {productViews.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {productViews.map((view) => (
                    <div
                      key={view.id}
                      className={`relative cursor-pointer border-2 ${selectedView === view.id
                        ? "border-red-600"
                        : "border-gray-200"
                        } rounded overflow-hidden`}
                      onClick={() => setSelectedView(view.id)}
                    >
                      <div className="relative h-24 w-full">
                        <Image
                          src={view.imageUrl}
                          alt={view.label}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="text-xs text-center py-1 bg-gray-50">
                        {view.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold mb-4">{data.product.name}</h1>

              {/* Color Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {data.colors.map((color) => (
                    <button
                      key={color.id}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedColor === color.color_value
                        ? "ring-2 ring-red-600 ring-offset-2"
                        : "border border-gray-200"
                        }`}
                      style={{ backgroundColor: color.color_value }}
                      onClick={() => setSelectedColor(color.color_value)}
                      title={color.color}
                    >
                      {selectedColor === color.color_value && (
                        <Check
                          className={`h-4 w-4 ${color.color_value === "#FFFFFF" ||
                            color.color_value.toLowerCase() === "#fff"
                            ? "text-black"
                            : "text-white"
                            }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => {
                    // Find size variant for current color to get quantity
                    const sizeVariant = data.sizes.find(
                      (s) =>
                        s.size === size &&
                        (!currentColor ||
                          s.shirtColor.toString() === currentColor.id)
                    );
                    const stockQuantity = sizeVariant?.quantity || 0;
                    const isOutOfStock = stockQuantity === 0;

                    return (
                      <button
                        key={size}
                        className={`px-4 py-2 ${selectedSize === size
                            ? "bg-red-600 text-white"
                            : isOutOfStock
                              ? "border border-gray-300 text-gray-400 bg-gray-100"
                              : "border border-gray-300 hover:border-gray-400"
                          } rounded-md text-sm font-medium min-w-[50px] relative`}
                        onClick={() => !isOutOfStock && setSelectedSize(size)}
                        disabled={isOutOfStock}
                      >
                        {size}
                        <div className="text-xs mt-1 font-normal">
                          {isOutOfStock ? (
                            <span className="text-gray-500">Out of stock</span>
                          ) : stockQuantity <= 5 ? (
                            <span className="text-amber-600">
                              Only {stockQuantity} left
                            </span>
                          ) : (
                            <span className="text-green-600">In stock</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Quantity</h3>
                <div className="flex items-center">
                  <button
                    onClick={decrementQuantity}
                    className="border border-gray-300 rounded-l-md px-3 py-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="border-t border-b border-gray-300 px-4 py-2 min-w-[60px] text-center">
                    {quantity}
                  </div>
                  <button
                    onClick={incrementQuantity}
                    className="border border-gray-300 rounded-r-md px-3 py-2 hover:bg-gray-100"
                    disabled={quantity >= getMaxAvailableQuantity()}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="ml-3 text-xs text-gray-500">
                    minimum quantity: 1
                  </span>
                </div>
              </div>

              {/* Price and Add to Cart */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-3">
                    <span className="text-xl font-bold text-red-600">
                      {formatPrice(data.product.base_price * quantity)}
                    </span>
                    <span className="text-xs ml-1">*GST Included</span>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="mb-3">
                  {getMaxAvailableQuantity() > 10 ? (
                    <div className="text-green-600 flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      <span>In stock</span>
                    </div>
                  ) : getMaxAvailableQuantity() > 0 ? (
                    <div className="text-amber-600 flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      <span>
                        Low stock: only {getMaxAvailableQuantity()} available
                      </span>
                    </div>
                  ) : (
                    <div className="text-red-600">Out of stock</div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 h-auto text-base"
                      onClick={() => createNewDesign()}
                      disabled={getMaxAvailableQuantity() === 0}
                    >
                      Start Designing
                    </Button>
                  </div>
                  {isSignedIn ? (
                    <Button
                      variant="outline"
                      className={cn(
                        "flex items-center justify-center py-3 h-auto",
                        inWishlist && "bg-gray-100"
                      )}
                      onClick={handleWishlistToggle}
                      disabled={isWishlistLoading}
                    >
                      {isWishlistLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : inWishlist ? (
                        <Heart className="h-4 w-4 mr-2 fill-red-600 text-red-600" />
                      ) : (
                        <Heart className="h-4 w-4 mr-2" />
                      )}
                      {inWishlist ? "Saved" : "Save"}
                    </Button>
                  ) : (
                    <SignInButton mode="modal">
                      <Button variant="outline" className="py-3 h-auto">
                        Sign in to Save
                      </Button>
                    </SignInButton>
                  )}
                </div>
              </div>

              {/* Expandable Sections */}
              <div className="space-y-2 mt-8 border-t border-gray-100 pt-4">
                {/* Description Section */}
                <div className="border border-gray-200 rounded">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => toggleSection("description")}
                  >
                    <h3 className="text-lg font-medium">Description</h3>
                    {expandedSection === "description" ? (
                      <Minus className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Plus className="h-5 w-5 text-gray-500" />
                    )}
                  </button>

                  {expandedSection === "description" && (
                    <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: data.product.description,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Category Section */}
                <div className="border border-gray-200 rounded">
                  <button
                    onClick={() => toggleSection("category")}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <h3 className="text-lg font-medium">Categories</h3>
                    {expandedSection === "category" ? (
                      <Minus className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Plus className="h-5 w-5 text-gray-500" />
                    )}
                  </button>

                  {expandedSection === "category" && (
                    <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-2">
                        {data.product.categories.map((category) => (
                          <Badge
                            key={category.id}
                            variant="outline"
                            className="cursor-default"
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Request Quote Button */}
            <div className="mt-4">
              <Button variant="outline" className="w-full py-3 h-auto" onClick={() => router.push('/request-quote')}>
                Request a quote
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
