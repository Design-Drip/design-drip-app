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
  DollarSign,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import Product type and actions
import type { Product } from "@/app/admin/products/page";
import { toggleProductStatus } from "@/app/admin/products/_actions";
import { EditProductForm } from "./EditProductForm";
import { ProductImageManager } from "./ProductImageManager";

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
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details
            </DialogTitle>
            <DialogDescription>
              Detailed product information including price, status, categories
              and creation time.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="info" className="mt-4">
            <TabsContent value="info" className="space-y-4">
              {/* Product Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      {product.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.categories.map((cat, index) => (
                            <Badge key={index} variant="secondary">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground mt-1">
                          Product does not belong to any category
                        </div>
                      )}
                    </div>
                    <Badge
                      variant={product.isActive ? "default" : "outline"}
                      className="ml-2"
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Price */}
                  <div className="flex items-center py-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">Price:</span>
                    <span className="ml-auto font-medium">
                      {formatPrice(product.default_price)}
                    </span>
                  </div>

                  {/* Product ID */}
                  <div className="flex items-center py-1">
                    <Tag className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">ID:</span>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">
                      {product.id}
                    </span>
                  </div>

                  <Separator className="my-3" />

                  {/* Description */}
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-muted-foreground">
                        Description:
                      </span>
                    </div>
                    <div className="text-sm">
                      {product.description || "No description provided"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dates Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Time Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Created:
                    </div>
                    <div>{formatDate(product.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Last Updated:
                    </div>
                    <div>{formatDate(product.updatedAt)}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    {product.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    Product Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    This product is currently
                    <span
                      className={
                        product.isActive
                          ? "text-green-500 font-medium"
                          : "text-amber-500 font-medium"
                      }
                    >
                      {product.isActive ? " active " : " inactive "}
                    </span>
                    and{" "}
                    {product.isActive
                      ? "visible to customers"
                      : "not visible to customers"}
                    .
                  </div>
                  <Button
                    variant={product.isActive ? "outline" : "default"}
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={isPending}
                    className="mt-4"
                  >
                    {isPending ? (
                      "Processing..."
                    ) : product.isActive ? (
                      <>
                        <ToggleLeft className="mr-2 h-4 w-4" />
                        Set as Inactive
                      </>
                    ) : (
                      <>
                        <ToggleRight className="mr-2 h-4 w-4" />
                        Set as Active
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-end items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/admin/products/${product.id}/variants`}>
                  <Layers className="mr-2 h-4 w-4" />
                  Manage Shirt Colors
                </Link>
              </Button>
              <Button onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Product
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

      {/* Product Image Manager */}
      {product && (
        <ProductImageManager
          productId={product.id}
          open={isImageManagerOpen}
          onOpenChange={setIsImageManagerOpen}
        />
      )}
    </>
  );
}
