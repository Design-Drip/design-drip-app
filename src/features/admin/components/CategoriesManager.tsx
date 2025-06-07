"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import {
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/app/admin/categories/_actions";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoriesManagerProps {
  initialCategories: Category[];
}

export function CategoriesManager({
  initialCategories,
}: CategoriesManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // State for add/edit dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const openAddDialog = () => {
    setFormData({ name: "", description: "" });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateCategory = () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    startTransition(async () => {
      try {
        const formDataToSubmit = new FormData();

        if (isEditing && currentCategory) {
          console.log(`Updating category with ID: ${currentCategory.id}`);
          formDataToSubmit.append("id", currentCategory.id);
          formDataToSubmit.append("name", formData.name);
          formDataToSubmit.append("description", formData.description || "");

          const result = await updateCategory(formDataToSubmit);
          if (result.success) {
            toast.success("Category updated successfully");

            // Update local state
            setCategories((prev) =>
              prev.map((cat) =>
                cat.id === currentCategory.id
                  ? {
                      ...cat,
                      name: formData.name,
                      description: formData.description,
                    }
                  : cat
              )
            );
            setIsDialogOpen(false);
          } else {
            toast.error(`Could not update category: ${result.message}`);
          }
        } else {
          console.log(`Adding new category with name: ${formData.name}`);
          formDataToSubmit.append("name", formData.name);
          formDataToSubmit.append("description", formData.description || "");

          const result = await addCategory(formDataToSubmit);
          if (result.success && result.data) {
            toast.success("Category added successfully");

            // Add to local state
            setCategories((prev) => [
              ...prev,
              {
                id: result.data.id,
                name: formData.name,
                description: formData.description,
              },
            ]);
            setIsDialogOpen(false);
          } else {
            toast.error(`Could not add category: ${result.message}`);
          }
        }

        router.refresh(); // Refresh the page to get updated data
      } catch (error) {
        toast.error("An error occurred");
        console.error(error);
      }
    });
  };

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;

    startTransition(async () => {
      try {
        console.log(`Deleting category with ID: ${categoryToDelete}`);
        const formDataToSubmit = new FormData();
        formDataToSubmit.append("id", categoryToDelete);

        const result = await deleteCategory(formDataToSubmit);

        if (result.success) {
          toast.success("Category deleted successfully");
          // Remove from local state
          setCategories((prev) =>
            prev.filter((cat) => cat.id !== categoryToDelete)
          );
          setIsDeleteDialogOpen(false);
          router.refresh(); // Refresh the page to get updated data
        } else {
          toast.error(`Could not delete category: ${result.message}`);
        }
      } catch (error) {
        toast.error("An error occurred");
        console.error(error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            {" "}
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Manage product categories for better organization
            </CardDescription>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {" "}
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center">
                      {" "}
                      <p className="text-muted-foreground mb-2">
                        No categories found
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openAddDialog}
                      >
                        {" "}
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Category
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      {category.description || (
                        <span className="text-muted-foreground text-sm italic">
                          No description
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update category information."
                : "Add a new category to organize products."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {" "}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter category name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter category description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddOrUpdateCategory}
              disabled={isPending || !formData.name.trim()}
            >
              {isPending ? "Processing..." : isEditing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The category will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
