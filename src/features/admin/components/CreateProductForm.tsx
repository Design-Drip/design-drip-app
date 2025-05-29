"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProduct } from "@/app/admin/products/_actions";
import { toast } from "sonner";

interface CreateProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductForm({
  open,
  onOpenChange,
}: CreateProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createProduct(formData);
      if (result.success) {
        toast.success("Product created successfully!");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(`Could not create product: ${result.message}`);
      }
    } catch (error) {
      toast.error("An error occurred while creating the product");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {" "}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Add New Product
          </DialogTitle>
          <DialogDescription>
            Enter new product information. Click save when done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter product name"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter product description"
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="default_price">Price (VND) *</Label>
              <Input
                id="default_price"
                name="default_price"
                type="number"
                min="0"
                step="1000"
                placeholder="Enter product price"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="categories">
                Danh mục (phân cách bởi dấu phẩy)
              </Label>
              <Input
                id="categories"
                name="categories"
                placeholder="T-Shirts, Hoodies, New Arrivals"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Nhập các danh mục, cách nhau bởi dấu phẩy (ví dụ: T-Shirts,
                Hoodies)
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang tạo..." : "Lưu sản phẩm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
