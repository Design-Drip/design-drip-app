"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { updateProduct } from "@/app/admin/products/_actions";
import { toast } from "sonner";

interface EditProductFormProps {
  productId: string;
  initialData: {
    name: string;
    description: string;
    default_price: number;
    isActive: boolean;
    categories: { id: string; name: string }[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductForm({
  productId,
  initialData,
  open,
  onOpenChange,
}: EditProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData.name,
    description: initialData.description || "",
    default_price: initialData.default_price,
    isActive: initialData.isActive,
    categories: initialData.categories.map((cat) => cat.name).join(", "),
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        default_price: initialData.default_price,
        isActive: initialData.isActive,
        categories: initialData.categories.map((cat) => cat.name).join(", "),
      });
    }
  }, [initialData, open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("id", productId);
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("description", formData.description);
      formDataToSubmit.append(
        "default_price",
        formData.default_price.toString()
      );
      formDataToSubmit.append("isActive", formData.isActive.toString());
      formDataToSubmit.append("categories", formData.categories);

      const result = await updateProduct(formDataToSubmit);

      if (result.success) {
        toast.success("Sản phẩm đã được cập nhật thành công!");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(`Không thể cập nhật sản phẩm: ${result.message}`);
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi cập nhật sản phẩm");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Chỉnh sửa sản phẩm
          </DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin cho sản phẩm này. Nhấn Lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Mô tả ngắn về sản phẩm"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="default_price">Giá (VNĐ)</Label>
              <Input
                id="default_price"
                name="default_price"
                type="number"
                value={formData.default_price}
                onChange={handleInputChange}
                placeholder="Nhập giá sản phẩm"
                min="0"
                step="1000"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categories">Danh mục</Label>
              <Input
                id="categories"
                name="categories"
                value={formData.categories}
                onChange={handleInputChange}
                placeholder="Các danh mục, phân cách bằng dấu phẩy"
              />
              <p className="text-xs text-muted-foreground">
                Nhập các danh mục cách nhau bởi dấu phẩy (ví dụ: T-shirts, Nam,
                Áo thun)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="isActive">Trạng thái hoạt động</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
              />
              <span className="text-sm text-muted-foreground">
                {formData.isActive ? "Đang hoạt động" : "Không hoạt động"}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
