"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { OrderFilters } from "@/features/admin/orders/components/OrderFilters";
import { OrdersTable } from "@/features/admin/orders/components/OrdersTable";
import { getOrdersQuery } from "@/features/orders/services/queries";

const ITEMS_PER_PAGE = 10;

export default function OrdersManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const statusParam = searchParams.get("status") || "all";
  const searchParam = searchParams.get("search") || "";
  const pageParam = parseInt(searchParams.get("page") || "1");

  // Update state when URL params change
  const status = statusParam;
  const search = searchParam;
  const page = pageParam;

  const { data, isLoading, isError } = useQuery({
    ...getOrdersQuery(
      page,
      ITEMS_PER_PAGE,
      status === "all" ? undefined : status,
      search || undefined
    ),
  });

  const handlePageChange = (newPage: number) => {
    // setPage(newPage);
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    if (search) params.set("search", search);
    params.set("page", newPage.toString());
    router.push(`/admin/orders?${params.toString()}`);
  };

  // Calculate stats from the orders data
  const stats = useMemo(() => {
    if (!data?.orders)
      return { total: 0, processing: 0, shipped: 0, delivered: 0 };

    const orders = data.orders;
    return {
      total: data.pagination?.totalOrders || 0,
      processing: orders.filter((order: any) => order.status === "processing")
        .length,
      shipped: orders.filter((order: any) => order.status === "shipped").length,
      delivered: orders.filter((order: any) => order.status === "delivered")
        .length,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Orders Management
            </h2>
            <p className="text-muted-foreground">Manage store orders</p>
          </div>
        </div>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 flex gap-3 items-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-600">
              There was an error loading orders. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orders = data?.orders || [];
  const pagination = data?.pagination || {
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
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
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

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
      <OrderFilters searchTerm={search} statusFilter={status} />

      {/* Orders Table */}
      {orders.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-muted-foreground">
              {search || status !== "all"
                ? "No orders match your current filters."
                : "No orders have been placed yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <OrdersTable orders={orders} />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        pagination.hasPrevPage && handlePageChange(page - 1)
                      }
                      className={
                        pagination.hasPrevPage
                          ? "cursor-pointer"
                          : "pointer-events-none opacity-50"
                      }
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter((pageNum) => {
                      return (
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        Math.abs(pageNum - page) <= 1
                      );
                    })
                    .map((pageNum, i, filteredPages) => {
                      if (i > 0 && filteredPages[i - 1] !== pageNum - 1) {
                        return (
                          <PaginationItem key={`ellipsis-${pageNum}`}>
                            <span className="flex h-9 w-9 items-center justify-center">
                              ...
                            </span>
                          </PaginationItem>
                        );
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            isActive={page === pageNum}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        pagination.hasNextPage && handlePageChange(page + 1)
                      }
                      className={
                        pagination.hasNextPage
                          ? "cursor-pointer"
                          : "pointer-events-none opacity-50"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
