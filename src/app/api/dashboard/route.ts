import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Mock data for dashboard - replace with real data later
    const dashboardData = {
      success: true,
      data: {
        overview: {
          totalUsers: 2847,
          totalOrders: 1294,
          totalRevenue: 45678900,
          totalProducts: 156,
        },
        recentOrders: [
          {
            _id: "67890123",
            totalAmount: 450000,
            status: "completed",
            createdAt: new Date().toISOString(),
          },
          {
            _id: "67890124",
            totalAmount: 320000,
            status: "processing",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: "67890125",
            totalAmount: 180000,
            status: "pending",
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: "67890126",
            totalAmount: 290000,
            status: "shipped",
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: "67890127",
            totalAmount: 520000,
            status: "delivered",
            createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          },
        ],
        revenue: {
          total: 8750000,
          average: 353000,
        },
        orders: {
          total: 234,
          delivered: 148,
          pending: 156,
          processing: 234,
          shipped: 189,
          canceled: 67,
        },
        products: {
          total: 156,
          active: 142,
          inactive: 14,
          variants: {
            total: 487,
            withImages: 423,
            withoutImages: 64,
          },
        },
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
