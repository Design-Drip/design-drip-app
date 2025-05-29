"use server";

import { checkRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import mongoose from 'mongoose';
import { Shirt, ShirtVariant, ShirtImage, Category } from '@/models/product';
import type { Product } from "./page";

// Connect to MongoDB
const connectMongoDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }
      
      console.log('Connecting to MongoDB...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of default 30s
        connectTimeoutMS: 10000,
      });
      console.log('Connected to MongoDB successfully');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Failed to connect to database');
  }
};

export async function getProducts(): Promise<Product[]> {
  if (!await checkRole("admin")) {
    return [];
  }

  try {
    await connectMongoDB();
    
    // Fetch shirts with populated categories
    const shirts = await Shirt.find().populate('categories').lean();
    
    // For each shirt, get its variants and images
    const productsWithDetails = await Promise.all(shirts.map(async (shirt: any) => {
      const variantsCount = await ShirtVariant.countDocuments({ shirt_id: shirt._id });
      const imagesCount = await ShirtImage.countDocuments({ shirt_id: shirt._id });
      
      // Map categories to strings if they exist
      const categories = shirt.categories?.map((cat: any) => 
        cat.name || "Unknown"
      ) || [];
      
      return {
        id: shirt._id.toString(),
        name: shirt.name,
        description: shirt.description || "",
        default_price: shirt.default_price,
        isActive: shirt.isActive ?? true,
        categories,
        imagesCount,
        variantsCount,
        createdAt: shirt.createdAt ? new Date(shirt.createdAt).getTime() : Date.now(),
        updatedAt: shirt.updatedAt ? new Date(shirt.updatedAt).getTime() : Date.now(),
      };
    }));
    
    return productsWithDetails;
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

export async function getProductDetails(productId: string) {
  if (!await checkRole("admin")) {
    return null;
  }

  try {
    await connectMongoDB();
    
    // Fetch the shirt with populated categories
    const shirt = await Shirt.findById(productId).populate('categories').lean() as any;
    
    if (!shirt) {
      return null;
    }
    
    // Get variants for this product
    const variants = await ShirtVariant.find({ shirt_id: productId }).lean() as any[];
    
    // Get images for this product
    const images = await ShirtImage.find({ shirt_id: productId }).lean() as any[];
    
    // Parse the shirt data including the string ID
    const product = {
      id: shirt._id.toString(),
      name: shirt.name,
      description: shirt.description || "",
      default_price: shirt.default_price,
      isActive: shirt.isActive ?? true,
      categories: (shirt.categories || []).map((cat: any) => ({
        id: cat._id.toString(),
        name: cat.name,
        description: cat.description || ""
      })),
      variants: variants.map((variant: any) => ({
        id: variant._id.toString(),
        size: variant.size,
        color: variant.color,
        additional_price: variant.additional_price || 0
      })),
      images: images.map((image: any) => ({
        id: image._id.toString(),
        url: image.url,
        is_primary: image.is_primary,
        view_side: image.view_side,
        width_editable_zone: image.width_editable_zone,
        height_editable_zone: image.height_editable_zone
      })),
      createdAt: shirt.createdAt ? new Date(shirt.createdAt).getTime() : Date.now(),
      updatedAt: shirt.updatedAt ? new Date(shirt.updatedAt).getTime() : Date.now()
    };
    
    return product;
  } catch (err) {
    console.error("Error fetching product details:", err);
    return null;
  }
}

export async function toggleProductStatus(formData: FormData) {
  const productId = formData.get("id") as string;
  const isActive = formData.get("isActive") === "true";

  if (!await checkRole("admin")) {
    return;
  }

  try {
    await connectMongoDB();
    
    // Update the product status
    await Shirt.findByIdAndUpdate(productId, { isActive: !isActive });

    // Revalidate the products page to show updated data
    revalidatePath("/admin/products");
  } catch (err) {
    console.error("Error toggling product status:", err);
  }
}

export async function deleteProduct(formData: FormData) {
  const productId = formData.get("id") as string;

  if (!await checkRole("admin")) {
    return;
  }

  try {
    await connectMongoDB();

    // Delete associated variants and images first
    await ShirtVariant.deleteMany({ shirt_id: productId });
    await ShirtImage.deleteMany({ shirt_id: productId });
    
    // Then delete the shirt itself
    await Shirt.findByIdAndDelete(productId);

    // Revalidate the products page to show updated data
    revalidatePath("/admin/products");
  } catch (err) {
    console.error("Error deleting product:", err);
  }
}

export async function createProduct(formData: FormData) {
  if (!await checkRole("admin")) {
    return { success: false, message: "Insufficient permissions" };
  }

  try {
    await connectMongoDB();
    
    // Extract product data from form
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const default_price = parseFloat(formData.get("default_price") as string);
    const categoryNames = (formData.get("categories") as string).split(',').map(cat => cat.trim());
    
    if (!name || !default_price) {
      return { success: false, message: "Name and price are required" };
    }
    
    // Find or create categories
    const categoryIds = [];
    for (const categoryName of categoryNames) {
      if (!categoryName) continue;
      
      // Find existing category or create new one
      let category = await Category.findOne({ name: categoryName });
      if (!category) {
        category = await Category.create({ name: categoryName });
        console.log(`Created new category: ${categoryName}`);
      }
      categoryIds.push(category._id);
    }
    
    // Create new shirt product
    const newShirt = await Shirt.create({
      name,
      description,
      default_price,
      categories: categoryIds,
      isActive: true
    });
    
    console.log(`Product created successfully with ID: ${newShirt._id}`);
    
    // Revalidate the products page to show updated data
    revalidatePath("/admin/products");
    
    return { 
      success: true, 
      message: "Product created successfully",
      productId: newShirt._id.toString()
    };
  } catch (err) {
    console.error("Error creating product:", err);
    return { success: false, message: "Failed to create product" };
  }
}

export async function updateProduct(formData: FormData) {
  if (!await checkRole("admin")) {
    return { success: false, message: "Insufficient permissions" };
  }

  try {
    await connectMongoDB();
    
    // Extract product data from form
    const productId = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const default_price = parseFloat(formData.get("default_price") as string);
    const isActive = formData.get("isActive") === "true";
    const categoryNames = (formData.get("categories") as string).split(',').map(cat => cat.trim());
    
    if (!productId || !name || !default_price) {
      return { success: false, message: "Product ID, name, and price are required" };
    }
    
    // Find or create categories
    const categoryIds = [];
    for (const categoryName of categoryNames) {
      if (!categoryName) continue;
      
      // Find existing category or create new one
      let category = await Category.findOne({ name: categoryName });
      if (!category) {
        category = await Category.create({ name: categoryName });
        console.log(`Created new category: ${categoryName}`);
      }
      categoryIds.push(category._id);
    }
    
    // Update the shirt product
    const updatedShirt = await Shirt.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        default_price,
        categories: categoryIds,
        isActive
      },
      { new: true }
    );
    
    if (!updatedShirt) {
      return { success: false, message: "Product not found" };
    }
    
    console.log(`Product updated successfully with ID: ${productId}`);
    
    // Revalidate the products page to show updated data
    revalidatePath("/admin/products");
    
    return { 
      success: true, 
      message: "Product updated successfully",
      productId: updatedShirt._id.toString()
    };
  } catch (err) {
    console.error("Error updating product:", err);
    return { success: false, message: "Failed to update product" };
  }
}

export async function getCategories() {
  try {
    await connectMongoDB();
    
    // Fetch all categories
    const categories = await Category.find().lean() as any[];
    
    // Format the categories
    return categories.map(category => ({
      id: category._id.toString(),
      name: category.name,
      description: category.description || ""
    }));
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
}
