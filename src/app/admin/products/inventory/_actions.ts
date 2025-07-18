"use server";

import { ShirtSizeVariant, ShirtColor, Shirt } from "@/models/product";
import { checkRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";

// Get inventory for a product (all colors and sizes)
export async function getProductInventory(productId: string) {
  if (!(await checkRole("admin"))) {
    return [];
  }

  try {
    await dbConnect();

    // Find all colors for this product
    const colors = await ShirtColor.find({ shirt_id: productId }).lean();

    // Get all size variants for these colors
    const inventoryItems = [];

    for (const color of colors) {
      const sizes = await ShirtSizeVariant.find({
        shirtColor: color._id,
      }).lean();

      inventoryItems.push({
        colorId: color._id.toString(),
        colorName: color.color,
        colorValue: color.color_value || "#000000",
        sizes: sizes.map((size) => ({
          sizeId: size._id.toString(),
          size: size.size,
          quantity: size.quantity,
          additionalPrice: size.additional_price,
        })),
      });
    }

    return inventoryItems;
  } catch (error) {
    console.error("Failed to fetch product inventory:", error);
    return [];
  }
}

// Update inventory quantity for a specific size
export async function updateInventoryQuantity(formData: FormData) {
  if (!(await checkRole("admin"))) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await dbConnect();

    const sizeId = formData.get("sizeId") as string;
    const quantity = parseInt(formData.get("quantity") as string) || 0;

    if (!sizeId) {
      return { success: false, message: "Size ID is required" };
    }

    // Make sure quantity is not negative
    const safeQuantity = Math.max(0, quantity);

    // Update the size's quantity
    const updatedSize = await ShirtSizeVariant.findByIdAndUpdate(
      sizeId,
      { quantity: safeQuantity },
      { new: true }
    );

    if (!updatedSize) {
      return { success: false, message: "Size not found" };
    }

    // Get the color to find the product ID
    const color = await ShirtColor.findById(updatedSize.shirtColor);
    if (color) {
      revalidatePath(`/admin/products/${color.shirt_id}/inventory`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating inventory quantity:", error);
    return {
      success: false,
      message: error.message || "Failed to update inventory",
    };
  }
}

// Batch update inventory quantities
export async function batchUpdateInventory(formData: FormData) {
  if (!(await checkRole("admin"))) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await dbConnect();

    const productId = formData.get("productId") as string;
    const updates = JSON.parse(formData.get("updates") as string);

    if (!productId || !updates || !Array.isArray(updates)) {
      return { success: false, message: "Invalid request data" };
    }

    // Process each update in the batch
    const updatePromises = updates.map(
      async (item: { sizeId: string; quantity: number }) => {
        const { sizeId, quantity } = item;
        const safeQuantity = Math.max(0, quantity);

        return ShirtSizeVariant.findByIdAndUpdate(sizeId, {
          quantity: safeQuantity,
        });
      }
    );

    await Promise.all(updatePromises);

    revalidatePath(`/admin/products/${productId}/inventory`);

    return { success: true };
  } catch (error: any) {
    console.error("Error batch updating inventory:", error);
    return {
      success: false,
      message: error.message || "Failed to update inventory",
    };
  }
}
