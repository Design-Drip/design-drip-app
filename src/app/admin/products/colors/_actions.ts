"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { ShirtColor } from "@/models/product";
import { checkRole } from "@/lib/roles";

// Kết nối MongoDB
const connectMongoDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error("MONGODB_URI is not defined in environment variables");
      }
      await mongoose.connect(uri);
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new Error("Failed to connect to database");
  }
};

// Add/Update product images for a specific color
export async function addProductImage(formData: FormData) {
  // Check for admin permissions
  const isAdmin = await checkRole("admin");
  if (!isAdmin) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const colorId = formData.get("colorId") as string;
    const viewSide = formData.get("viewSide") as
      | "front"
      | "back"
      | "left"
      | "right";
    const imageUrl = formData.get("imageUrl") as string;
    const isPrimary = formData.get("isPrimary") === "true";

    // Đảm bảo lấy đúng giá trị cho tất cả trường
    // Sử dụng ép kiểu parseInt và mặc định nếu cần
    const width = 800; // Kích thước cố định
    const height = 797; // Kích thước cố định

    // Đọc các giá trị editable zone từ form và ép kiểu thành số
    const widthEditableZone =
      parseInt(formData.get("widthEditableZone") as string, 10) || 300;
    const heightEditableZone =
      parseInt(formData.get("heightEditableZone") as string, 10) || 300;
    const xEditableZone =
      parseInt(formData.get("xEditableZone") as string, 10) || 250;
    const yEditableZone =
      parseInt(formData.get("yEditableZone") as string, 10) || 400;

    if (!colorId || !viewSide || !imageUrl) {
      return {
        success: false,
        message: "Color ID, view side and image URL are required",
      };
    }

    await connectMongoDB();

    // Get the current color
    const color = await ShirtColor.findById(colorId);
    if (!color) {
      return { success: false, message: "Color not found" };
    }

    // Prepare the new image data with all fields
    const newImage = {
      _id: new mongoose.Types.ObjectId(),
      view_side: viewSide,
      url: imageUrl,
      is_primary: isPrimary,
      width: width,
      height: height,
      width_editable_zone: widthEditableZone,
      height_editable_zone: heightEditableZone,
      x_editable_zone: xEditableZone,
      y_editable_zone: yEditableZone,
    };

    console.log("New image data:", JSON.stringify(newImage, null, 2));

    // Remove any existing image with same view_side
    const existingImageIndex = color.images.findIndex(
      (img) => img.view_side === viewSide
    );

    if (existingImageIndex !== -1) {
      color.images.splice(existingImageIndex, 1);
    }

    // If setting this image as primary, make sure others are not primary
    if (isPrimary) {
      color.images.forEach((img) => {
        img.is_primary = false;
      });
    }

    // Add the new image
    color.images.push(newImage);

    // Save the updated color
    await color.save({ validateBeforeSave: true });

    revalidatePath(`/admin/products/${color.shirt_id}/variants`);

    return { success: true };
  } catch (error) {
    console.error("Error adding product image:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Add a new color to a product
export async function addProductColor(formData: FormData) {
  // Check for admin permissions
  const isAdmin = await checkRole("admin");
  if (!isAdmin) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const productId = formData.get("productId") as string;
    const colorName = formData.get("colorName") as string;
    const colorValue = formData.get("colorValue") as string;

    if (!productId || !colorName) {
      return {
        success: false,
        message: "Product ID and color name are required",
      };
    }

    await connectMongoDB();

    // Check if color already exists for this product
    const existingColor = await ShirtColor.findOne({
      shirt_id: productId,
      color: colorName,
    });

    if (existingColor) {
      return {
        success: false,
        message: "This color already exists for this product",
      };
    }

    // Create new color
    const newColor = await ShirtColor.create({
      shirt_id: productId,
      color: colorName,
      color_value: colorValue || "#000000", // Default to black if no color value provided
      images: [], // Start with empty images array
    });

    revalidatePath(`/admin/products/${productId}/variants`);

    return {
      success: true,
      data: {
        id: newColor._id?.toString(),
        name: newColor.color,
        value: newColor.color_value,
      },
    };
  } catch (error) {
    console.error("Error adding product color:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update a product color
export async function updateProductColor(formData: FormData) {
  // Check for admin permissions
  const isAdmin = await checkRole("admin");
  if (!isAdmin) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const colorId = formData.get("colorId") as string;
    const colorName = formData.get("colorName") as string;
    const colorValue = formData.get("colorValue") as string;

    if (!colorId || !colorName) {
      return {
        success: false,
        message: "Color ID and name are required",
      };
    }

    await connectMongoDB();

    const updatedColor = await ShirtColor.findByIdAndUpdate(
      colorId,
      {
        color: colorName,
        color_value: colorValue || "#000000",
      },
      { new: true, runValidators: true }
    );

    if (!updatedColor) {
      return { success: false, message: "Color not found" };
    }

    revalidatePath(`/admin/products/${updatedColor.shirt_id}/variants`);

    return {
      success: true,
      data: {
        id: updatedColor._id?.toString(),
        name: updatedColor.color,
        value: updatedColor.color_value,
      },
    };
  } catch (error) {
    console.error("Error updating product color:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Delete a product color
export async function deleteProductColor(formData: FormData) {
  // Check for admin permissions
  const isAdmin = await checkRole("admin");
  if (!isAdmin) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const colorId = formData.get("colorId") as string;

    if (!colorId) {
      return {
        success: false,
        message: "Color ID is required",
      };
    }

    await connectMongoDB();

    const color = await ShirtColor.findById(colorId);
    if (!color) {
      return { success: false, message: "Color not found" };
    }

    const productId = color.shirt_id;

    await ShirtColor.findByIdAndDelete(colorId);

    revalidatePath(`/admin/products/${productId}/variants`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting product color:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get colors for a specific product
export async function getProductColors(productId: string) {
  try {
    await connectMongoDB();

    const colors = await ShirtColor.find({ shirt_id: productId }).lean();

    return colors.map((color) => ({
      id: color._id.toString(),
      name: color.color,
      value: color.color_value,
      images:
        color.images?.map((img: any) => ({
          id: img._id?.toString(),
          url: img.url,
          view_side: img.view_side,
          is_primary: img.is_primary,
          width: img.width || 800,
          height: img.height || 797,
          editable_area: {
            width: img.width_editable_zone || 300,
            height: img.height_editable_zone || 300,
            x: img.x_editable_zone || 250,
            y: img.y_editable_zone || 400,
          },
        })) || [],
    }));
  } catch (error) {
    console.error("Error getting product colors:", error);
    return [];
  }
}
