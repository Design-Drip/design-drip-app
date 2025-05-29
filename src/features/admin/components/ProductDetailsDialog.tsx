"use client";
import {
  Package,
  Tag,
  Calendar,
  Layers,
  Image,
  ToggleLeft,
  ToggleRight,
  Pencil,
} from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// Import Product type and actions
import type { Product } from "@/app/admin/products/page";
import { toggleProductStatus } from "@/app/admin/products/_actions";
import { EditProductForm } from "./EditProductForm";

interface ProductDetailsDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsDialog({
  product,
  open,
  onOpenChange,
}: ProductDetailsDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

  if (!product) return null;

  const formatDate = (timestamp: number | undefined | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString("vi-VN");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleToggleStatus = () => {
    if (!product) return;

    const formData = new FormData();
    formData.append("id", product.id);
    formData.append("isActive", product.isActive.toString());

    startTransition(async () => {
      await toggleProductStatus(formData);
      router.refresh();
      onOpenChange(false);
    });
  };

  return (
    <>
      {" "}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Detailed product information including price, status, categories
              and creation time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Product Info Section */}
            <Card>
              {" "}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{product.name}</h3>{" "}
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.description || "No description"}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {" "}
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {product.categories.map((cat, index) => (
                      <Badge key={index} variant="outline">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <Separator />{" "}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Price:</p>
                      <p className="font-medium">
                        {formatPrice(product.default_price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Product ID:
                      </p>
                      <p className="font-medium truncate">{product.id}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Section */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                {" "}
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Number of Variants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{product.variantsCount}</p>
                  <p className="text-xs text-muted-foreground">
                    Sizes and colors
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Number of Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{product.imagesCount}</p>
                  <p className="text-xs text-muted-foreground">Images</p>
                </CardContent>
              </Card>
            </div>

            {/* Dates Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Created At:</p>
                    <p className="font-medium">
                      {formatDate(product.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last Updated:
                    </p>
                    <p className="font-medium">
                      {formatDate(product.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant={product.isActive ? "destructive" : "default"}
                onClick={handleToggleStatus}
                disabled={isPending}
              >
                {product.isActive ? (
                  <>
                    <ToggleLeft className="mr-2 h-4 w-4" />
                    Stop Selling
                  </>
                ) : (
                  <>
                    <ToggleRight className="mr-2 h-4 w-4" />
                    For Sale
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Product Form Dialog */}
      {product && (
        <EditProductForm
          productId={product.id}
          initialData={{
            name: product.name,
            description: product.description || "",
            default_price: product.default_price,
            isActive: product.isActive,
            categories: product.categories.map((cat) => ({
              id: "",
              name: cat,
            })),
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </>
  );
}
