"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, X, AlertCircle, Plus, Check } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateProduct } from "@/app/admin/products/_actions";
import { getCategories } from "@/app/admin/categories/_actions";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface EditProductFormProps {
  productId: string;
  initialData: {
    name: string;
    description: string;
    default_price: number;
    isActive: boolean;
    categories: { id: string; name: string }[]; // Đảm bảo categories có cấu trúc đúng
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CategoryItem {
  id: string;
  name: string;
}

export function EditProductForm({
  productId,
  initialData,
  open,
  onOpenChange,
}: EditProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  // Thay đổi kiểu dữ liệu của categories trong formData để lưu trữ cả id và name
  const [formData, setFormData] = useState({
    name: initialData.name,
    description: initialData.description || "",
    default_price: initialData.default_price,
    isActive: initialData.isActive,
    categories: initialData.categories, // Giữ đúng mảng object {id, name}
  });

  // Fetch categories when dialog opens
  useEffect(() => {
    if (open) {
      fetchCategories();

      // Cập nhật lại formData với đầy đủ thông tin
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        default_price: initialData.default_price,
        isActive: initialData.isActive,
        categories: initialData.categories, // Mảng {id, name} từ initialData
      });
    }
  }, [initialData, open]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Unable to load product categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  // Hàm để thêm category mới
  const handleAddCategory = (categoryId: string) => {
    // Check if category already exists
    if (!formData.categories.some((cat) => cat.id === categoryId)) {
      // Find the full category object from the fetched categories list
      const categoryToAdd = categories.find((cat) => cat.id === categoryId);
      if (categoryToAdd) {
        setFormData((prev) => ({
          ...prev,
          categories: [
            ...prev.categories,
            { id: categoryId, name: categoryToAdd.name },
          ],
        }));
      }
    }
    setShowCategorySelect(false); // Ẩn dropdown sau khi chọn
  };

  // Cập nhật hàm removeCategory để chỉ xóa đúng category được chọn
  const removeCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat.id !== categoryId),
    }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("id", productId);
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("description", formData.description);

      // Ensure price is a valid number
      const priceValue = parseFloat(formData.default_price.toString());
      if (isNaN(priceValue)) {
        toast.error("Please enter a valid price");
        setIsLoading(false);
        return;
      }

      formDataToSubmit.append("default_price", priceValue.toString());
      formDataToSubmit.append("isActive", formData.isActive.toString());

      // Extract category IDs for submission
      // Khi gửi dữ liệu, bảo đảm chỉ gửi các ID hợp lệ (có dạng MongoDB ObjectId)
      const categoryIds = formData.categories
        .filter((cat) => cat.id && cat.id.match(/^[0-9a-fA-F]{24}$/)) // Kiểm tra ID có đúng định dạng MongoDB ObjectId
        .map((cat) => cat.id);

      console.log("Sending category IDs:", categoryIds);
      formDataToSubmit.append("categories", categoryIds.join(","));

      const result = await updateProduct(formDataToSubmit);

      if (result.success) {
        toast.success("Product updated successfully!");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(`Unable to update product: ${result.message}`);
      }
    } catch (error) {
      toast.error("An error occurred while updating the product");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Edit Product
          </DialogTitle>
          <DialogDescription>
            Update product information. Click Save when done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Short description of the product"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="default_price">Price (VND)</Label>
              <Input
                id="default_price"
                name="default_price"
                type="number"
                value={formData.default_price}
                onChange={handleInputChange}
                placeholder="Enter product price"
                min="0"
                step="1000"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <Label>Categories</Label>
                {categories.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-xs"
                    onClick={() => setShowCategorySelect(!showCategorySelect)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Category
                  </Button>
                )}
              </div>

              {isLoadingCategories ? (
                <div className="text-sm text-muted-foreground">
                  Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <Alert variant="warning" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No categories found. Please create categories in the
                    Categories tab first.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {showCategorySelect && (
                    <div className="border rounded-md p-2 mt-1 mb-2 bg-background shadow-sm">
                      <div className="max-h-[200px] overflow-y-auto space-y-1">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className={`px-2 py-1.5 rounded-sm text-sm cursor-pointer hover:bg-muted flex justify-between items-center ${
                              formData.categories.some(
                                (cat) => cat.id === category.id
                              )
                                ? "opacity-50"
                                : ""
                            }`}
                            onClick={() =>
                              formData.categories.some(
                                (cat) => cat.id === category.id
                              )
                                ? removeCategory(category.id)
                                : handleAddCategory(category.id)
                            }
                          >
                            <span>{category.name}</span>
                            {formData.categories.some(
                              (cat) => cat.id === category.id
                            ) ? (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.categories.map((category) => (
                        <Badge
                          key={category.id}
                          variant="secondary"
                          className="pr-1 pl-3"
                        >
                          {category.name}
                          <button
                            type="button"
                            className="ml-1 rounded-full hover:bg-muted p-1"
                            onClick={() => removeCategory(category.id)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2">
                      Product won't belong to any category
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="isActive">Product Status</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
              />
              <span className="text-sm text-muted-foreground ml-auto">
                {formData.isActive ? "Active" : "Inactive"}
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
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
