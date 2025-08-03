"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Package,
  Loader2,
  ChevronRight,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { formatOrderDate } from "@/lib/date";
import { formatPrice } from "@/lib/price";
import { getOrdersQuery } from "@/features/orders/services/queries";

const limit = 5;

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam = searchParams?.get("status") || "all";
  const pageParam = parseInt(searchParams?.get("page") || "1");

  const [status, setStatus] = useState<string>(statusParam);
  const [page, setPage] = useState<number>(pageParam);

  const { data, isLoading, isError } = useQuery({
    ...getOrdersQuery(page, limit, status || undefined),
  });

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
    const params = new URLSearchParams();
    if (newStatus) params.set("status", newStatus);
    router.push(`/orders${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", newPage.toString());
    router.push(`/orders?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto max-w-5xl py-10 px-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 flex gap-3 items-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-600">
              There was an error loading your orders. Please try again later.
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
    <div className="container mx-auto max-w-5xl py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Your Orders</h1>
          <p className="text-muted-foreground">View and track your orders</p>
        </div>

        <div className="w-full md:w-auto">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipping">Shipping</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-muted-foreground mb-6">
              {status
                ? `You don't have any orders with status "${status}".`
                : "You haven't placed any orders yet."}
            </p>
            <Button asChild>
              <Link href="/settings/saved-designs">Browse Designs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 py-4">
                  <div className="flex flex-col md:flex-row justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        Order #{order.id}
                      </CardTitle>
                      <CardDescription>
                        Placed on {formatOrderDate(order.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-medium">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="py-4">
                  <div className="space-y-3">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="h-14 w-14 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-8 w-8 m-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.color} •
                            {item.sizes
                              .map((s) => `${s.size} (${s.quantity})`)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    ))}

                    {order.items.length > 2 && (
                      <p className="text-sm text-muted-foreground">
                        + {order.items.length - 2} more items
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
                      // Show first page, current page, last page, and pages around current
                      return (
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        Math.abs(pageNum - page) <= 1
                      );
                    })
                    .map((pageNum, i, filteredPages) => {
                      // Add ellipsis where pages are skipped
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
