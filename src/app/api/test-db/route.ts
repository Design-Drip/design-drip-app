import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Shirt, ShirtSizeVariant, ShirtColor } from "@/models/product";
import { Order } from "@/models/order";
import User from "@/models/user";

export async function GET() {
  try {
    await dbConnect();
    
    console.log("=== Testing Database Connection ===");
    
    // Count documents in each collection
    const shirtsCount = await Shirt.countDocuments();
    const ordersCount = await Order.countDocuments();
    const usersCount = await User.countDocuments();
    const variantsCount = await ShirtSizeVariant.countDocuments();
    const colorsCount = await ShirtColor.countDocuments();
    
    // Get sample data
    const sampleShirt = await Shirt.findOne().lean();
    const sampleOrder = await Order.findOne().lean();
    
    const result = {
      database: "design-drip-dev",
      collections: {
        shirts: shirtsCount,
        orders: ordersCount,
        users: usersCount,
        variants: variantsCount,
        colors: colorsCount
      },
      samples: {
        shirt: sampleShirt,
        order: sampleOrder ? {
          id: sampleOrder._id,
          totalAmount: sampleOrder.totalAmount,
          status: sampleOrder.status
        } : null
      }
    };
    
    console.log("Database test result:", JSON.stringify(result, null, 2));
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({ 
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
