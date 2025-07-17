"use client";

import { useState, useEffect, useTransition } from "react";
import { Save, Loader2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getProductInventory,
  updateInventoryQuantity,
  batchUpdateInventory,
} from "@/app/admin/products/inventory/_actions";

interface ProductInventoryManagerProps {
  product: {
    id: string;
    name: string;
    description?: string;
    default_price: number;
    isActive: boolean;
  };
}

interface InventoryItem {
  colorId: string;
  colorName: string;
  colorValue: string;
  sizes: {
    sizeId: string;
    size: string;
    quantity: number;
    additionalPrice: number;
  }[];
}

interface InventoryUpdate {
  sizeId: string;
  quantity: number;
}

export function ProductInventoryManager({
  product,
}: ProductInventoryManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [updates, setUpdates] = useState<Map<string, number>>(new Map());
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    startTransition(async () => {
      try {
        const inventoryData = await getProductInventory(product.id);
        setInventory(inventoryData);
      } catch (error) {
        toast.error("Failed to fetch inventory data");
        console.error(error);
      }
    });
  };

  // Handle inventory quantity change
  const handleQuantityChange = (sizeId: string, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity >= 0) {
      setUpdates(new Map(updates.set(sizeId, quantity)));
    }
  };

  // Get current quantity (from updates if changed, otherwise from inventory)
  const getCurrentQuantity = (colorId: string, sizeId: string) => {
    if (updates.has(sizeId)) {
      return updates.get(sizeId)!;
    }

    const color = inventory.find((item) => item.colorId === colorId);
    const size = color?.sizes.find((s) => s.sizeId === sizeId);
    return size?.quantity || 0;
  };

  // Update a single size inventory
  const updateSingleInventory = async (sizeId: string, quantity: number) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("sizeId", sizeId);
        formData.append("quantity", quantity.toString());

        const result = await updateInventoryQuantity(formData);

        if (result.success) {
          toast.success("Inventory updated successfully");
          // Update the local state
          setInventory((prev) => {
            return prev.map((color) => ({
              ...color,
              sizes: color.sizes.map((size) =>
                size.sizeId === sizeId ? { ...size, quantity } : size
              ),
            }));
          });

          // Remove this item from the updates map
          const newUpdates = new Map(updates);
          newUpdates.delete(sizeId);
          setUpdates(newUpdates);
        } else {
          toast.error(`Failed to update inventory: ${result.message}`);
        }
      } catch (error) {
        toast.error("An error occurred while updating inventory");
        console.error(error);
      }
    });
  };

  // Save all pending updates
  const saveAllUpdates = async () => {
    if (updates.size === 0) return;

    setSaveStatus("saving");
    startTransition(async () => {
      try {
        const updatesList: InventoryUpdate[] = [];
        updates.forEach((quantity, sizeId) => {
          updatesList.push({ sizeId, quantity });
        });

        const formData = new FormData();
        formData.append("productId", product.id);
        formData.append("updates", JSON.stringify(updatesList));

        const result = await batchUpdateInventory(formData);

        if (result.success) {
          // Update the local inventory state with the new values
          setInventory((prev) => {
            return prev.map((color) => ({
              ...color,
              sizes: color.sizes.map((size) => {
                const newQuantity = updates.get(size.sizeId);
                return newQuantity !== undefined
                  ? { ...size, quantity: newQuantity }
                  : size;
              }),
            }));
          });

          // Clear the updates
          setUpdates(new Map());
          setSaveStatus("saved");
          toast.success("All inventory updates saved successfully");

          // Reset status after 2 seconds
          setTimeout(() => {
            setSaveStatus("idle");
          }, 2000);
        } else {
          setSaveStatus("idle");
          toast.error(`Failed to save updates: ${result.message}`);
        }
      } catch (error) {
        setSaveStatus("idle");
        toast.error("An error occurred while saving inventory updates");
        console.error(error);
      }
    });
  };

  // Quick increment/decrement functions
  const incrementQuantity = (sizeId: string, colorId: string) => {
    const currentQty = getCurrentQuantity(colorId, sizeId);
    setUpdates(new Map(updates.set(sizeId, currentQty + 1)));
  };

  const decrementQuantity = (sizeId: string, colorId: string) => {
    const currentQty = getCurrentQuantity(colorId, sizeId);
    if (currentQty > 0) {
      setUpdates(new Map(updates.set(sizeId, currentQty - 1)));
    }
  };

  // Check if there are any changes to save
  const hasChanges = updates.size > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Update stock levels for each size and color
              </CardDescription>
            </div>
            {hasChanges && (
              <Button
                onClick={saveAllUpdates}
                disabled={isPending || saveStatus === "saving"}
              >
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : saveStatus === "saved" ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save All Changes
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                No variants found for this product.
              </p>
              <p className="text-sm mt-2">
                Add colors and sizes first in the Variants section.
              </p>
            </div>
          ) : (
            <Tabs defaultValue={inventory[0]?.colorId} className="w-full">
              <TabsList className="mb-4 w-full flex flex-wrap h-auto gap-2 justify-start">
                {inventory.map((item) => (
                  <TabsTrigger
                    key={item.colorId}
                    value={item.colorId}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.colorValue }}
                    />
                    {item.colorName}
                  </TabsTrigger>
                ))}
              </TabsList>

              {inventory.map((item) => (
                <TabsContent key={item.colorId} value={item.colorId}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: item.colorValue }}
                          />
                          {item.colorName} - Inventory
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Size</TableHead>
                              <TableHead>Stock Quantity</TableHead>
                              <TableHead className="text-right">
                                Status
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {item.sizes.map((size) => {
                              const currentQuantity = getCurrentQuantity(
                                item.colorId,
                                size.sizeId
                              );
                              const isUpdated = updates.has(size.sizeId);

                              return (
                                <TableRow key={size.sizeId}>
                                  <TableCell>
                                    <div className="font-medium">
                                      {size.size}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() =>
                                          decrementQuantity(
                                            size.sizeId,
                                            item.colorId
                                          )
                                        }
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>

                                      <Input
                                        type="number"
                                        min="0"
                                        className="w-20 h-8"
                                        value={currentQuantity}
                                        onChange={(e) =>
                                          handleQuantityChange(
                                            size.sizeId,
                                            e.target.value
                                          )
                                        }
                                      />

                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() =>
                                          incrementQuantity(
                                            size.sizeId,
                                            item.colorId
                                          )
                                        }
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>

                                      {isUpdated && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            updateSingleInventory(
                                              size.sizeId,
                                              currentQuantity
                                            )
                                          }
                                          disabled={isPending}
                                        >
                                          Update
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {currentQuantity > 10 ? (
                                      <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700"
                                      >
                                        In Stock
                                      </Badge>
                                    ) : currentQuantity > 0 ? (
                                      <Badge
                                        variant="outline"
                                        className="bg-yellow-50 text-yellow-700"
                                      >
                                        Low Stock
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="bg-red-50 text-red-700"
                                      >
                                        Out of Stock
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          {hasChanges && (
            <Button
              onClick={saveAllUpdates}
              disabled={isPending || saveStatus === "saving"}
              size="sm"
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-3 w-3" />
                  Save All Changes
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
