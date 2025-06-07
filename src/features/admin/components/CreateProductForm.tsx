"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, X, Plus, Tag, AlertCircle, Check } from "lucide-react";
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
import { getCategories } from "@/app/admin/categories/_actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

interface CategoryItem {
  id: string;
  name: string;
}

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    default_price: 0,
    isActive: true,
    categories: [] as CategoryItem[], // Thay đổi kiểu dữ liệu mảng từ string[] sang CategoryItem[]
  });

  // Fetch categories when dialog opens
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const categoriesData = await getCategories();
      console.log("Fetched categories:", categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Không thể tải danh mục sản phẩm");
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
    if (!formData.categories.some((cat) => cat.id === categoryId)) {
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
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("description", formData.description);

      // Ensure price is a valid number
      const priceValue = parseFloat(formData.default_price.toString());
      if (isNaN(priceValue)) {
        toast.error("Vui lòng nhập giá hợp lệ");
        setIsLoading(false);
        return;
      }

      formDataToSubmit.append("default_price", priceValue.toString());
      formDataToSubmit.append("isActive", formData.isActive.toString());

      // Extract category IDs for submission
      const categoryIds = formData.categories.map((cat) => cat.id);
      formDataToSubmit.append("categories", categoryIds.join(","));

      console.log("Submitting categories:", formData.categories);
      const result = await createProduct(formDataToSubmit);
      if (result.success) {
        toast.success("Product created successfully!");
        onOpenChange(false);
        router.refresh();
        // Reset form data
        setFormData({
          name: "",
          description: "",
          default_price: 0,
          isActive: true,
          categories: [],
        });
      } else {
        toast.error(`Unable to create product: ${result.message}`);
      }
    } catch (error) {
      toast.error("An error occurred while creating the product");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        description: "",
        default_price: 0,
        isActive: true,
        categories: [],
      });
      setShowCategorySelect(false);
    }
  }, [open]);

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {" "}
            <Package className="h-5 w-5" /> Add New Product
          </DialogTitle>
          <DialogDescription>
            Enter new product information. Click save when finished.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              {" "}
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter product name"
                required
                className="mt-1"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              {" "}
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter product description"
                className="mt-1 min-h-[100px]"
                value={formData.description}
                onChange={handleInputChange}
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
                value={formData.default_price || ""}
                onChange={handleInputChange}
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
                    Thêm danh mục
                  </Button>
                )}
              </div>

              {isLoadingCategories ? (
                <div className="text-sm text-muted-foreground">
                  Đang tải danh mục...
                </div>
              ) : categories.length === 0 ? (
                <Alert variant="warning" className="mt-2">
                  <AlertCircle className="h-4 w-4" />{" "}
                  <AlertDescription>
                    No categories found. Please create categories in the
                    Categories tab before adding products.
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
                      Product will not belong to any category
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
              />{" "}
              <Label htmlFor="isActive" className="cursor-pointer">
                Product is active
              </Label>
              <span className="text-sm text-muted-foreground ml-auto">
                {formData.isActive ? "Active" : "Inactive"}
              </span>
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
              {isLoading ? "Creating..." : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
