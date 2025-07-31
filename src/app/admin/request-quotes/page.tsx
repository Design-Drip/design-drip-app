"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  MessageSquareQuote,
  DollarSign,
  Users,
  FileText
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { RequestQuoteFilters } from "@/features/admin/request-quotes/components/RequestQuoteFilters";
import { RequestQuotesTable } from "@/features/admin/request-quotes/components/RequestQuotesTable";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import PaginationBtn from "@/components/pagination-button";
import { getRequestQuotesQuery } from "@/features/request-quote/services/queries";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function RequestQuotesManagementPage() {
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const status = searchParams.get("status") || "all";
  const searchQuery = searchParams.get("search") || "";

  const [filters, setFilters] = useState({
    page,
    limit,
    status: status !== "all" ? status : undefined,
    search: searchQuery || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data, isLoading, error } = useQuery(getRequestQuotesQuery(filters));

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Request Quotes Management</h1>
            <p className="text-muted-foreground">
              Manage and respond to customer quote requests
            </p>
          </div>
        </div>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="flex items-center justify-center py-10">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Failed to load request quotes
              </h3>
              <p className="text-red-600 mb-4">
                {error instanceof Error ? error.message : "There was an error loading request quotes. Please try again."}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requestQuotes = data?.items || [];
  const totalPages = data?.totalItems ? Math.ceil(data.totalItems / limit) : 0;

  const stats = {
    total: requestQuotes.length,
    pending: requestQuotes.filter((quote: any) => quote.status === "pending").length,
    quoted: requestQuotes.filter((quote: any) => quote.status === "quoted").length,
    approved: requestQuotes.filter((quote: any) => quote.status === "approved").length,
    rejected: requestQuotes.filter((quote: any) => quote.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Request Quotes Management</h1>
          <p className="text-muted-foreground">
            Manage and respond to customer quote requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quoted</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quoted}</div>
            <p className="text-xs text-muted-foreground">
              Quotes provided
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? ((stats.approved / stats.total) * 100).toFixed(1)
                : 0}
              % approval rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <RequestQuoteFilters
        filters={{
          search: filters.search || "",
          status: filters.status || "all",
        }}
        onFiltersChange={handleFiltersChange}
      />

      {/* Request Quotes Table */}
      {requestQuotes.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <MessageSquareQuote className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              No request quotes found
            </h2>
            <p className="text-muted-foreground">
              {filters.search || filters.status !== "all"
                ? "No quotes match your current filters."
                : "No quote requests have been submitted yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <RequestQuotesTable requestQuotes={requestQuotes} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      className={
                        page <= 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={page === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, page + 1))
                      }
                      className={
                        page >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
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