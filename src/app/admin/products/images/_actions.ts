"use server";

import { revalidatePath } from "next/cache";
import { ShirtColor } from "@/models/product";
import { checkRole } from "@/lib/roles";
import dbConnect from "@/lib/db";

// Upload images for a product color
export async function uploadProductImages(formData: FormData) {
  // Check for admin permissions
  const isAdmin = await checkRole("admin");
  if (!isAdmin) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const productId = formData.get("productId") as string;
    const colorId = formData.get("colorId") as string;
    const imagesDataRaw = formData.get("images") as string;

    if (!productId || !colorId || !imagesDataRaw) {
      return {
        success: false,
        message: "Missing required information: productId, colorId, or images",
      };
    }

    // Parse và xử lý dữ liệu images từ client
    const imagesData = JSON.parse(imagesDataRaw);

    // Đảm bảo đủ 8 trường cho mỗi image object và ép kiểu thành số
    const formattedImages = imagesData.map((img: any) => ({
      view_side: img.view_side,
      url: img.url,
      is_primary: img.is_primary === true,
      width: 800, // Kích thước cố định
      height: 797, // Kích thước cố định

      // Đọc các giá trị editable_zone với Number() để ép kiểu
      // Nếu không có giá trị hoặc không thể parse, sử dụng giá trị mặc định
      width_editable_zone: Number.isFinite(Number(img.width_editable_zone))
        ? Number(img.width_editable_zone)
        : 300,

      height_editable_zone: Number.isFinite(Number(img.height_editable_zone))
        ? Number(img.height_editable_zone)
        : 300,

      x_editable_zone: Number.isFinite(Number(img.x_editable_zone))
        ? Number(img.x_editable_zone)
        : 250,

      y_editable_zone: Number.isFinite(Number(img.y_editable_zone))
        ? Number(img.y_editable_zone)
        : 400,
    }));

    console.log(
      "Formatted images data:",
      JSON.stringify(formattedImages, null, 2)
    );

    await dbConnect();

    // Tìm và cập nhật hoặc tạo mới ShirtColor
    const shirtColor = await ShirtColor.findOneAndUpdate(
      { _id: colorId },
      { images: formattedImages },
      {
        new: true,
        runValidators: true, // Đảm bảo schema validation được áp dụng
      }
    );

    if (!shirtColor) {
      return { success: false, message: "ShirtColor not found" };
    }

    revalidatePath(`/admin/products/${productId}/variants`);
    return { success: true };
  } catch (error) {
    console.error("Error uploading product images:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get product colors
export async function getProductColors(productId: string) {
  try {
    await dbConnect();

    const colors = await ShirtColor.find({ shirt_id: productId }).lean();

    return colors.map((color: any) => ({
      id: color._id.toString(),
      name: color.color,
      value: color.color_value,
      images:
        color.images?.map((img: any) => ({
          id: img._id.toString(),
          url: img.url,
          view_side: img.view_side,
          is_primary: img.is_primary,
          editable_area: {
            width: img.width_editable_zone,
            height: img.height_editable_zone,
            x: img.x_editable_zone,
            y: img.y_editable_zone,
          },
        })) || [],
    }));
  } catch (error) {
    console.error("Error getting product colors:", error);
    return [];
  }
}

// Delete a product image
export async function deleteProductImage(formData: FormData) {
  // Check for admin permissions
  const isAdmin = await checkRole("admin");
  if (!isAdmin) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const imageId = formData.get("imageId") as string;

    if (!imageId) {
      return {
        success: false,
        message: "Image ID is required",
      };
    }

    await dbConnect();

    // Tìm color chứa image cần xóa
    const shirtColor = await ShirtColor.findOne({
      "images._id": imageId,
    });

    if (!shirtColor) {
      return { success: false, message: "Image not found" };
    }

    // Xóa image từ mảng images
    shirtColor.images = shirtColor.images.filter(
      (img: any) => img._id.toString() !== imageId
    );

    // Lưu lại document
    await shirtColor.save({ validateBeforeSave: true });

    return { success: true };
  } catch (error) {
    console.error("Error deleting product image:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
