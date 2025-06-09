"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { Category } from "@/models/product";
import { checkRole } from "@/lib/roles";

// Connect to MongoDB
const connectMongoDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error("MONGODB_URI is not defined in environment variables");
      }
      console.log("Connecting to MongoDB for category operations...");
      await mongoose.connect(uri);
      console.log("MongoDB connection successful");
    } else {
      console.log("MongoDB already connected");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new Error("Failed to connect to database");
  }
};

// Get all categories
export async function getCategories() {
  try {
    await connectMongoDB();

    console.log("Fetching categories from database...");
    // Fetch all categories
    const categories = (await Category.find().lean()) as any[];
    console.log("Raw categories from DB:", JSON.stringify(categories, null, 2));

    // Format the categories before returning
    const formattedCategories = categories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
      description: category.description || "",
    }));

    console.log(
      "Formatted categories:",
      JSON.stringify(formattedCategories, null, 2)
    );
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

    await connectMongoDB();

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

    await connectMongoDB();

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

    await connectMongoDB();

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
