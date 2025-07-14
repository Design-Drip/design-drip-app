"use server";

import { revalidatePath } from "next/cache";
import { ShirtColor, ShirtSizeVariant, Shirt } from "@/models/product";
import { checkRole } from "@/lib/roles";
import { FIXED_SIZES } from "@/constants/size";
import dbConnect from "@/lib/db";

// Get colors for a product
export async function getProductColors(productId: string) {
  if (!(await checkRole("admin"))) {
    return [];
  }

  try {
    await dbConnect();

    // Find colors for this product
    const colors = await ShirtColor.find({ shirt_id: productId }).lean();

    return colors.map((color: any) => ({
      id: color._id.toString(),
      name: color.color,
      value: color.color_value || "#000000",
      hasImages: color.images && color.images.length > 0,
    }));
  } catch (error) {
    console.error("Failed to fetch product colors:", error);
    return [];
  }
}

// Get details of a specific color
export async function getColorDetails(colorId: string) {
  if (!(await checkRole("admin"))) {
    return null;
  }

  try {
    await dbConnect();

    // Find the color
    const color = await ShirtColor.findById(colorId).lean();

    if (!color) {
      return null;
    }

    return {
      id: color._id.toString(),
      name: color.color,
      value: color.color_value || "#000000",
      images: color.images?.map((img: any) => ({
        id: img._id?.toString() || "",
        url: img.url,
        view_side: img.view_side,
        is_primary: img.is_primary,
        editable_area:
          img.width_editable_zone || img.height_editable_zone
            ? {
                width: img.width_editable_zone || 200,
                height: img.height_editable_zone || 200,
                x: img.x_editable_zone || 0,
                y: img.y_editable_zone || 0,
              }
            : undefined,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch color details:", error);
    return null;
  }
}

// Add a color for a product
export async function addProductColor(formData: FormData) {
  if (!(await checkRole("admin"))) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await dbConnect();

    const productId = formData.get("productId") as string;
    const name = formData.get("name") as string;
    const value = formData.get("value") as string;

    if (!productId || !name) {
      return { success: false, message: "Missing required fields" };
    }

    // Check if color already exists for this product
    const existingColor = await ShirtColor.findOne({
      shirt_id: productId,
      color: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingColor) {
      return {
        success: false,
        message: "Color already exists for this product",
      };
    }

    // Create new color without initial images
    // Chỉ tạo màu mà không tạo image, images sẽ được thêm sau
    const newColor = await ShirtColor.create({
      shirt_id: productId,
      color: name,
      color_value: value,
      images: [], // Mảng rỗng, không cần ảnh ngay lúc tạo
    });

    // Tự động thêm các size cố định cho màu này
    const shirt = await Shirt.findById(productId);
    if (!shirt) {
      return { success: false, message: "Product not found" };
    }

    // Thêm các sizes cố định cho màu này
    await Promise.all(
      FIXED_SIZES.map((size) =>
        ShirtSizeVariant.create({
          shirtColor: newColor._id,
          size,
          additional_price: 0, // Mặc định không có giá cộng thêm
        })
      )
    );

    revalidatePath(`/admin/products/${productId}/variants`);

    return {
      success: true,
      colorId: newColor._id?.toString(),
    };
  } catch (error: any) {
    console.error("Error adding product color:", error);
    return { success: false, message: error.message || "Failed to add color" };
  }
}

// Delete a product color
export async function deleteProductColor(formData: FormData) {
  if (!(await checkRole("admin"))) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await dbConnect();

    const colorId = formData.get("colorId") as string;

    if (!colorId) {
      return { success: false, message: "Color ID is required" };
    }

    // Get the product ID before deleting the color
    const color = await ShirtColor.findById(colorId);
    if (!color) {
      return { success: false, message: "Color not found" };
    }
    const productId = color.shirt_id;

    // Delete all sizes for this color
    await ShirtSizeVariant.deleteMany({ shirtColor: colorId });

    // Delete the color
    await ShirtColor.findByIdAndDelete(colorId);

    revalidatePath(`/admin/products/${productId}/variants`);

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product color:", error);
    return {
      success: false,
      message: error.message || "Failed to delete color",
    };
  }
}

// Get sizes for a color
export async function getProductSizes(colorId: string) {
  if (!(await checkRole("admin"))) {
    return [];
  }

  try {
    await dbConnect();

    // Find sizes for this color
    const sizes = await ShirtSizeVariant.find({ shirtColor: colorId }).lean();

    return sizes.map((size: any) => ({
      id: size._id.toString(),
      size: size.size,
      additional_price: size.additional_price || 0,
      colorId: size.shirtColor.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch product sizes:", error);
    return [];
  }
}

// Add a size for a color
export async function addProductSize(formData: FormData) {
  if (!(await checkRole("admin"))) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await dbConnect();

    const colorId = formData.get("colorId") as string;
    const size = formData.get("size") as string;
    const additional_price =
      parseFloat(formData.get("additional_price") as string) || 0;

    if (!colorId || !size) {
      return { success: false, message: "Missing required fields" };
    }

    // Check if size already exists for this color
    const existingSize = await ShirtSizeVariant.findOne({
      shirtColor: colorId,
      size: { $regex: new RegExp(`^${size}$`, "i") },
    });

    if (existingSize) {
      return { success: false, message: "Size already exists for this color" };
    }

    // Create new size
    const newSize = await ShirtSizeVariant.create({
      shirtColor: colorId,
      size,
      additional_price,
    });

    // Get the product ID to revalidate the path
    const color = await ShirtColor.findById(colorId);
    if (color) {
      revalidatePath(`/admin/products/${color.shirt_id}/variants`);
    }

    return {
      success: true,
      sizeId: newSize._id?.toString(),
    };
  } catch (error: any) {
    console.error("Error adding product size:", error);
    return { success: false, message: error.message || "Failed to add size" };
  }
}

// Delete a product size
export async function deleteProductSize(formData: FormData) {
  if (!(await checkRole("admin"))) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await dbConnect();

    const sizeId = formData.get("sizeId") as string;

    if (!sizeId) {
      return { success: false, message: "Size ID is required" };
    }

    // Find the size to get the color and product IDs
    const size = await ShirtSizeVariant.findById(sizeId);
    if (!size) {
      return { success: false, message: "Size not found" };
    }

    // Get the product ID for path revalidation
    const color = await ShirtColor.findById(size.shirtColor);
    const productId = color?.shirt_id;

    // Delete the size
    await ShirtSizeVariant.findByIdAndDelete(sizeId);

    if (productId) {
      revalidatePath(`/admin/products/${productId}/variants`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product size:", error);
    return {
      success: false,
      message: error.message || "Failed to delete size",
    };
  }
}

// Update size price
export async function updateSizePrice(formData: FormData) {
  if (!(await checkRole("admin"))) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await dbConnect();

    const sizeId = formData.get("sizeId") as string;
    const additional_price =
      parseFloat(formData.get("additional_price") as string) || 0;

    if (!sizeId) {
      return { success: false, message: "Size ID is required" };
    }

    // Update the size's additional price
    const updatedSize = await ShirtSizeVariant.findByIdAndUpdate(
      sizeId,
      { additional_price },
      { new: true }
    );

    if (!updatedSize) {
      return { success: false, message: "Size not found" };
    }

    // Get the color to find the product ID
    const color = await ShirtColor.findById(updatedSize.shirtColor);
    if (color) {
      revalidatePath(`/admin/products/${color.shirt_id}/variants`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating size price:", error);
    return {
      success: false,
      message: error.message || "Failed to update size price",
    };
  }
}
