"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CartItem from "@/components/cart/CartItem";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { getCartQuery } from "@/features/cart/services/queries";
import {
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
} from "@/features/cart/services/mutations";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { formatPrice } from "@/lib/price";

const ITEMS_PER_PAGE = 4;

export default function Cart() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const {
    data: cartData,
    isLoading,
    isError,
    refetch,
  } = useQuery(getCartQuery());

  const updateCartMutation = useUpdateCartItemMutation();
  const removeCartMutation = useRemoveFromCartMutation();

  useEffect(() => {
    if (cartData?.items) {
      setSelectedItems([]);
    }
  }, [cartData?.items]);

  const currentCartItems = cartData?.items
    ? cartData.items.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      )
    : [];

  const totalPages = cartData?.items
    ? Math.ceil(cartData.totalItems / ITEMS_PER_PAGE)
    : 1;

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleUpdateQuantity = (
    itemId: string,
    size: string,
    quantity: number
  ) => {
    if (!cartData) return;

    const item = cartData.items.find((item) => item.id === itemId);
    if (!item) return;

    const updatedSizes = item.data.map((sizeData) => ({
      size: sizeData.size,
      quantity: sizeData.size === size ? quantity : sizeData.quantity,
    }));

    updateCartMutation.mutate(
      {
        itemId,
        payload: { quantityBySize: updatedSizes },
      },
      {
        onSuccess: () => {
          toast.success("Cart updated");
        },
        onError: (error) => {
          toast.error("Failed to update cart");
          console.error(error);
        },
      }
    );
  };

  const handleRemoveItem = (itemId: string) => {
    removeCartMutation.mutate(itemId, {
      onSuccess: () => {
        setSelectedItems((prev) => prev.filter((id) => id !== itemId));
        toast.success("Item removed from cart");
      },
      onError: (error) => {
        toast.error("Failed to remove item");
        console.error(error);
      },
    });
  };

  const handleToggleSelect = (itemId: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAll = () => {
    if (cartData?.items) {
      if (selectedItems.length === currentCartItems.length) {
        setSelectedItems((prev) =>
          prev.filter((id) => !currentCartItems.some((item) => item.id === id))
        );
      } else {
        const currentIds = currentCartItems.map((item) => item.id);
        setSelectedItems((prev) => {
          const existingIds = prev.filter(
            (id) => !currentCartItems.some((item) => item.id === id)
          );
          return [...existingIds, ...currentIds];
        });
      }
    }
  };

  const calculateItemTotal = (item) => {
    return item.data.reduce(
      (sum, sizeData) => sum + sizeData.pricePerSize * sizeData.quantity,
      0
    );
  };

  const subtotal = cartData?.items
    ? cartData.items
        .filter((item) => selectedItems.includes(item.id))
        .reduce((sum, item) => sum + calculateItemTotal(item), 0)
    : 0;

  // Calculate shipping based on subtotal
  // Assuming shipping is free for orders over 200000
  const shipping = subtotal > 200000 ? 0 : 10000;
  const total = subtotal + shipping;

  const allVisibleSelected =
    currentCartItems.length > 0 &&
    currentCartItems.every((item) => selectedItems.includes(item.id));
  const hasSelectedItems = selectedItems.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            There was an error loading your cart.
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!cartData?.items || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          </div>

          {/* Empty Cart */}
          <div className="bg-white rounded-xl p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link href="/products">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getPaginationNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);

      // Calculate start and end of middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        startPage = 2;
        endPage = 4;
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push("ellipsis-start");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      // Always include last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-2">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-8 justify-center">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <span className="text-sm text-gray-500">
            ({cartData.totalItems} items)
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Select All */}
            <div className="flex items-center gap-3 mb-4 p-4 bg-white rounded-xl border border-gray-100">
              <Checkbox
                checked={allVisibleSelected && currentCartItems.length > 0}
                onCheckedChange={handleSelectAll}
                className="w-5 h-5"
              />
              <span className="font-medium text-gray-900">
                Select All ({selectedItems.length}/{cartData.totalItems})
              </span>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {currentCartItems.map((item) => {
                // Get the first image as primary image or use placeholder
                const primaryImage =
                  item.previewImages?.length > 0
                    ? item.previewImages[0].url
                    : "/api/placeholder/300/300";

                // Calculate total price for this item
                const itemTotal = calculateItemTotal(item);

                return (
                  <CartItem
                    key={item.id}
                    id={item.id}
                    designId={item.designId} // Pass designId to CartItem
                    name={`${item.designName} - ${item.name}`}
                    price={
                      itemTotal /
                      item.data.reduce(
                        (sum, sizeData) => sum + sizeData.quantity,
                        0
                      )
                    }
                    image={primaryImage}
                    quantity={item.data.reduce(
                      (sum, sizeData) => sum + sizeData.quantity,
                      0
                    )}
                    size={item.data
                      .map(
                        (sizeData) => `${sizeData.size} (${sizeData.quantity})`
                      )
                      .join(", ")}
                    color={item.color}
                    selected={selectedItems.includes(item.id)}
                    onUpdateQuantity={(id, qty) => {
                      // Keep this for compatibility, but we'll use OrderModal instead
                      if (item.data.length > 0) {
                        handleUpdateQuantity(id, item.data[0].size, qty);
                      }
                    }}
                    onRemove={handleRemoveItem}
                    onToggleSelect={handleToggleSelect}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {getPaginationNumbers().map((page, index) => {
                      if (
                        page === "ellipsis-start" ||
                        page === "ellipsis-end"
                      ) {
                        return (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <span className="flex h-9 w-9 items-center justify-center">
                              ...
                            </span>
                          </PaginationItem>
                        );
                      }

                      return (
                        <PaginationItem key={index}>
                          <PaginationLink
                            isActive={currentPage === page}
                            onClick={() => handlePageChange(page as number)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="rounded-xl p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `${formatPrice(shipping)}`
                    )}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Add {formatPrice(200000 - subtotal)} more for free shipping!
                  </p>
                </div>
              )}

              <Button
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3"
                disabled={!hasSelectedItems}
              >
                Proceed to Checkout
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
