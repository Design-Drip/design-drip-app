import { Package, CheckCircle2, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getOrders } from "./_action";
import { OrderFilters } from "@/features/admin/orders/components/OrderFilters";
import { OrdersTable } from "@/features/admin/orders/components/OrdersTable";
import PaginationBtn from "@/components/pagination-button";
import { clerkClient, User } from "@clerk/nextjs/server";

const ITEMS_PER_PAGE = 10;
export interface ClerkUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  imageUrl?: string;
  isActive: boolean;
  lastSignInAt?: number | null;
  createdAt: number;
  updatedAt: number;
  role?: string;
}
export default async function OrdersManagementPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    status?: string;
    pageNum?: string;
  };
}) {
  // Get the search and status parameters
  const searchTerm = searchParams.search || "";
  const statusFilter = searchParams.status || "all";
  const page = parseInt(searchParams.pageNum || "1", 10);

  // Fetch orders with server-side pagination
  const result = await getOrders(
    page,
    ITEMS_PER_PAGE,
    statusFilter,
    searchTerm
  );
  const orders = result.data || [];
  const pagination = result.pagination || {
    totalOrders: 0,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Fetch users from Clerk
  const client = await clerkClient();
  const clerkUsersResponse = await client.users.getUserList({
    limit: 100,
  });
  const clerkUsersList = clerkUsersResponse.data;
  const users: ClerkUser[] = clerkUsersList.map((user: User) => {
    const primaryEmail =
      user.emailAddresses.find(
        (email: any) => email.id === user.primaryEmailAddressId
      )?.emailAddress || "";

    return {
      id: user.id,
      email: primaryEmail,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      fullName:
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || primaryEmail,
      imageUrl: user.imageUrl,
      isActive: !user.banned,
      lastSignInAt: user.lastSignInAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: (user.publicMetadata.role as string) || "",
    };
  });
  // Count by status - only based on current page data
  const stats = {
    total: pagination.totalOrders,
    processing: pagination.totalProcessing,
    shipped: pagination.totalShipped,
    delivered: pagination.totalDelivered,
    shipping: pagination.totalShipping,
    canceled: pagination.totalCanceled,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Orders Management
          </h2>
          <p className="text-muted-foreground">Manage and track store orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipping</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shipping}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shipped}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <OrderFilters searchTerm={searchTerm} statusFilter={statusFilter} />

      {/* Orders Table */}
      {orders.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all"
                ? "No orders match your current filters."
                : "No orders have been placed yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <OrdersTable orders={orders} users={users} />
          <PaginationBtn
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
          />
        </>
      )}
    </div>
  );
}
