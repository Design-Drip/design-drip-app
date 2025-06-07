"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Palette,
  CircleOff,
  ArrowRight,
  UserSquare,
  Circle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

import {
  addProductColor,
  deleteProductColor,
  getProductColors,
  getProductSizes,
  updateSizePrice,
  getFixedSizes,
} from "@/app/admin/products/variants/_actions";

interface ProductVariantsManagerProps {
  product: {
    id: string;
    name: string;
    description?: string;
    default_price: number;
    isActive: boolean;
    categories: {
      id: string;
      name: string;
      description: string;
    }[];
  };
}

interface ProductColor {
  id: string;
  name: string;
  value: string;
  hasImages: boolean;
}

interface ProductSize {
  id: string;
  size: string;
  additional_price: number;
  colorId: string;
}

export function ProductVariantsManager({
  product,
}: ProductVariantsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // States for colors
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [newColor, setNewColor] = useState({ name: "", value: "#000000" });
  const [isAddColorDialogOpen, setIsAddColorDialogOpen] = useState(false);
  const [colorToDelete, setColorToDelete] = useState<string | null>(null);
  const [isDeleteColorDialogOpen, setIsDeleteColorDialogOpen] = useState(false);

  // States for sizes
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [editingSizeId, setEditingSizeId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [sizeToDelete, setSizeToDelete] = useState<string | null>(null);
  const [isDeleteSizeDialogOpen, setIsDeleteSizeDialogOpen] = useState(false);

  // Size Manager Dialog
  const [isSizeManagerOpen, setIsSizeManagerOpen] = useState(false);

  // Fetch colors when component mounts
  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    startTransition(async () => {
      try {
        const fetchedColors = await getProductColors(product.id);
        setColors(fetchedColors);
      } catch (error) {
        toast.error("Failed to fetch product colors");
        console.error(error);
      }
    });
  };

  const fetchSizes = async (colorId: string) => {
    startTransition(async () => {
      try {
        const fetchedSizes = await getProductSizes(colorId);
        setSizes(fetchedSizes);
      } catch (error) {
        toast.error("Failed to fetch product sizes");
        console.error(error);
      }
    });
  };

  // Color management
  const handleAddColor = async () => {
    if (!newColor.name.trim()) {
      toast.error("Color name cannot be empty");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("productId", product.id);
        formData.append("name", newColor.name);
        formData.append("value", newColor.value);

        const result = await addProductColor(formData);

        if (result.success) {
          setColors([
            ...colors,
            {
              id: result.colorId,
              name: newColor.name,
              value: newColor.value,
              hasImages: false,
            },
          ]);
          setNewColor({ name: "", value: "#000000" });
          setIsAddColorDialogOpen(false);
          toast.success("Color added successfully");
          router.refresh();
        } else {
          toast.error(`Failed to add color: ${result.message}`);
        }
      } catch (error) {
        toast.error("An error occurred while adding the color");
        console.error(error);
      }
    });
  };

  const handleDeleteColor = async () => {
    if (!colorToDelete) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("colorId", colorToDelete);

        const result = await deleteProductColor(formData);

        if (result.success) {
          setColors(colors.filter((color) => color.id !== colorToDelete));
          setColorToDelete(null);
          setIsDeleteColorDialogOpen(false);
          toast.success("Color deleted successfully");
          // If the deleted color was selected, reset selection
          if (selectedColor?.id === colorToDelete) {
            setSelectedColor(null);
            setSizes([]);
          }
          router.refresh();
        } else {
          toast.error(`Failed to delete color: ${result.message}`);
        }
      } catch (error) {
        toast.error("An error occurred while deleting the color");
        console.error(error);
      }
    });
  };

  const handleSelectColor = (color: ProductColor) => {
    setSelectedColor(color);
    fetchSizes(color.id);
    setIsSizeManagerOpen(true);
  };

  // Handle size price editing
  const handleSaveSizePrice = async (sizeId: string) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("sizeId", sizeId);
        formData.append("additional_price", editingPrice.toString());

        const result = await updateSizePrice(formData);

        if (result.success) {
          setSizes(
            sizes.map((size) =>
              size.id === sizeId
                ? { ...size, additional_price: editingPrice }
                : size
            )
          );
          setEditingSizeId(null);
          toast.success("Size price updated successfully");
          router.refresh();
        } else {
          toast.error(`Failed to update size price: ${result.message}`);
        }
      } catch (error) {
        toast.error("An error occurred while updating the size");
        console.error(error);
      }
    });
  };

  const startEditingPrice = (size: ProductSize) => {
    setEditingSizeId(size.id);
    setEditingPrice(size.additional_price);
  };

  const cancelEditingPrice = () => {
    setEditingSizeId(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleBackToProducts = () => {
    router.push("/admin/products");
  };

  return (
    <div className="space-y-6">
      {/* Back to Products Button */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleBackToProducts}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>

      {/* Colors Tab */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Product Colors</h3>
            <p className="text-sm text-muted-foreground">
              Add and manage colors for this product
            </p>
          </div>
          <Button onClick={() => setIsAddColorDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Color
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Color</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Sizes</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colors.length > 0 ? (
                colors.map((color) => (
                  <TableRow
                    key={color.id}
                    className={
                      selectedColor?.id === color.id ? "bg-muted/50" : ""
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-full border shadow-sm"
                          style={{ backgroundColor: color.value }}
                          title={`Color: ${color.name}`}
                        />
                        <div>
                          <div className="font-medium">{color.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {color.value}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {color.hasImages ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700"
                        >
                          Images Added
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-500">
                          No Images
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectColor(color)}
                      >
                        Manage Sizes
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/admin/products/${product.id}/images?color=${color.id}`}
                          >
                            <Palette className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            setColorToDelete(color.id);
                            setIsDeleteColorDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CircleOff className="h-8 w-8 text-muted-foreground opacity-40" />
                      <h3 className="font-medium">No colors added yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Add your first color to start creating variants
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Color Dialog */}
      <Dialog
        open={isAddColorDialogOpen}
        onOpenChange={setIsAddColorDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Color</DialogTitle>
            <DialogDescription>
              Create a new color for this product
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="colorName">Color Name</Label>
              <Input
                id="colorName"
                placeholder="e.g., Navy Blue, Red"
                value={newColor.name}
                onChange={(e) =>
                  setNewColor({ ...newColor, name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="colorValue">Color Value</Label>
              <div className="flex gap-3 items-center">
                <div
                  className="h-10 w-10 rounded-md border"
                  style={{ backgroundColor: newColor.value }}
                />
                <Input
                  id="colorValue"
                  type="color"
                  value={newColor.value}
                  onChange={(e) =>
                    setNewColor({ ...newColor, value: e.target.value })
                  }
                  className="w-full h-10"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddColorDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddColor}
              disabled={isPending || !newColor.name.trim()}
            >
              {isPending ? "Adding..." : "Add Color"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Color Confirmation */}
      <AlertDialog
        open={isDeleteColorDialogOpen}
        onOpenChange={setIsDeleteColorDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Color</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the color and all associated sizes and images.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteColor}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Size Manager Dialog */}
      <Dialog
        open={isSizeManagerOpen && selectedColor !== null}
        onOpenChange={setIsSizeManagerOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded-full border"
                style={{ backgroundColor: selectedColor?.value }}
              />
              Manage Sizes for {selectedColor?.name}
            </DialogTitle>
            <DialogDescription>
              Update pricing for each size variant
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead>Additional Price</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sizes.length > 0 ? (
                    sizes.map((size) => (
                      <TableRow key={size.id}>
                        <TableCell>
                          <div className="font-medium">{size.size}</div>
                        </TableCell>
                        <TableCell>
                          {editingSizeId === size.id ? (
                            <Input
                              type="number"
                              min="0"
                              step="1000"
                              value={editingPrice}
                              onChange={(e) =>
                                setEditingPrice(parseInt(e.target.value) || 0)
                              }
                              className="w-32"
                            />
                          ) : (
                            formatPrice(size.additional_price)
                          )}
                        </TableCell>
                        <TableCell>
                          {formatPrice(
                            product.default_price +
                              (editingSizeId === size.id
                                ? editingPrice
                                : size.additional_price)
                          )}
                        </TableCell>
                        <TableCell>
                          {editingSizeId === size.id ? (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveSizePrice(size.id)}
                                disabled={isPending}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEditingPrice}
                                disabled={isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingPrice(size)}
                              disabled={isPending}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <UserSquare className="h-8 w-8 text-muted-foreground opacity-40" />
                          <h3 className="font-medium">No sizes found</h3>
                          <p className="text-sm text-muted-foreground">
                            This color should have default sizes
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSizeManagerOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Next Steps</h3>
        <div className="flex flex-col gap-4 md:flex-row">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-base">1. Add Colors</CardTitle>
              <CardDescription>Add colors for this product</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                First, add the available colors for this product.
              </p>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-base">2. Manage Sizes</CardTitle>
              <CardDescription>Edit size prices for each color</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                For each color, manage the available sizes.
              </p>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-base">3. Upload Images</CardTitle>
              <CardDescription>Add images for each color</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click the palette icon to upload images for each color.
              </p>
            </CardContent>
            {/* <CardFooter>
              {selectedColor && (
                <Button className="w-full" asChild>
                  <Link
                    href={`/admin/products/${product.id}/images?color=${selectedColor.id}`}
                  >
                    <Palette className="mr-2 h-4 w-4" />
                    Upload Images for {selectedColor.name}
                  </Link>
                </Button>
              )}
            </CardFooter> */}
          </Card>
        </div>
      </div>
    </div>
  );
}
