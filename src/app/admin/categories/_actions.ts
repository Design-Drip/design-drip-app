"use server";

import { revalidatePath } from "next/cache";
import { Category } from "@/models/product";
import { checkRole } from "@/lib/roles";
import dbConnect from "@/lib/db";

// Get all categories
export async function getCategories() {
  try {
    await dbConnect();

    const categories = (await Category.find().lean()) as any[];

    const formattedCategories = categories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
      description: category.description || "",
    }));

    return formattedCategories;
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
}

// Add a new category
export async function addCategory(formData: FormData) {
  // Check for admin permissions
  const isAdmin = await checkRole("admin");
  if (!isAdmin) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name) {
      return { success: false, message: "Category name is required" };
    }

    await dbConnect();

    // Check if category with the same name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return {
        success: false,
        message: "Category with this name already exists",
      };
    }

    // Create new category
    const category = await Category.create({ name, description });

    console.log(`Category created successfully with ID: ${category._id}`);

    // Revalidate the admin pages
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");

    return {
      success: true,
      data: {
        id: category._id?.toString(),
        name: category.name,
        description: category.description || "",
      },
    };
  } catch (err) {
    console.error("Error adding category:", err);
    return { success: false, message: "Failed to add category" };
  }
}

// Update a category
export async function updateCategory(formData: FormData) {
  // Check for admin permissions
  const isAdmin = await checkRole("admin");
  if (!isAdmin) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!id || !name) {
      return { success: false, message: "Category ID and name are required" };
    }

    await dbConnect();

    // Check if category with the same name already exists (excluding this one)
    const existingCategory = await Category.findOne({ name, _id: { $ne: id } });
    if (existingCategory) {
      return {
        success: false,
        message: "Another category with this name already exists",
      };
    }

    // Update category
    const category = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );

    if (!category) {
      return { success: false, message: "Category not found" };
    }

    console.log(`Category updated successfully with ID: ${id}`);

    // Revalidate the admin pages
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");

    return {
      success: true,
      data: {
        id: category._id?.toString(),
        name: category.name,
        description: category.description || "",
      },
    };
  } catch (err) {
    console.error("Error updating category:", err);
    return { success: false, message: "Failed to update category" };
  }
}

// Delete a category
export async function deleteCategory(formData: FormData) {
  // Check for admin permissions
  const isAdmin = await checkRole("admin");
  if (!isAdmin) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, message: "Category ID is required" };
    }

    await dbConnect();

    console.log(`Attempting to delete category with ID: ${id}`);

    // Delete category
    const result = await Category.findByIdAndDelete(id);

    if (!result) {
      return { success: false, message: "Category not found" };
    }

    console.log(`Category deleted successfully with ID: ${id}`);

    // Revalidate the admin pages
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");

    return { success: true };
  } catch (err) {
    console.error("Error deleting category:", err);
    return { success: false, message: "Failed to delete category" };
  }
}
