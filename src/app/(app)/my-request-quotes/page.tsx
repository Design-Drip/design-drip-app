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
  FileText,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatOrderDate } from "@/lib/date";
import { formatPrice } from "@/lib/price";
import { getRequestQuotesQuery } from "@/features/request-quote/services/queries";
import { cn } from "@/lib/utils";

const limit = 10;

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case "reviewing":
        return {
          label: "Reviewing",
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "quoted":
        return {
          label: "Quoted",
          className: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "approved":
        return {
          label: "Approved",
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "rejected":
        return {
          label: "Rejected",
          className: "bg-red-100 text-red-800 border-red-200",
        };
      case "completed":
        return {
          label: "Completed",
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", config.className)}
    >
      {config.label}
    </Badge>
  );
};

export default function MyRequestQuotesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const statusParam = searchParams.get("status") || "all";
  const typeParam = searchParams.get("type") || "all";
  const pageParam = parseInt(searchParams.get("page") || "1");
  const searchParam = searchParams.get("search") || "";

  const [status, setStatus] = useState<string>(statusParam);
  const [type, setType] = useState<string>(typeParam);
  const [page, setPage] = useState<number>(pageParam);
  const [searchQuery, setSearchQuery] = useState<string>(searchParam);

  // Fetch request quotes
  const { data, isLoading, isError } = useQuery({
    ...getRequestQuotesQuery({
      page,
      limit,
      status: status !== "all" ? status : undefined,
      type: type !== "all" ? type : undefined,
      search: searchQuery || undefined,
    }),
  });

  const requestQuotes = data?.items || [];
  const totalPages = data?.totalItems ? Math.ceil(data.totalItems / limit) : 0;

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
    updateURL({ status: newStatus, page: 1 });
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setPage(1);
    updateURL({ type: newType, page: 1 });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    updateURL({ search: searchQuery, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURL({ page: newPage });
  };

  const updateURL = (params: Record<string, any>) => {
    const urlParams = new URLSearchParams();
    const currentParams = {
      status,
      type,
      search: searchQuery,
      page,
      ...params,
    };

    Object.entries(currentParams).forEach(([key, value]) => {
      if (value && value !== "all" && value !== 1) {
        urlParams.set(key, value.toString());
      }
    });

    const url = `/my-request-quotes${urlParams.toString() ? `?${urlParams.toString()}` : ""
      }`;
    router.push(url);
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
      <div className="container mx-auto max-w-6xl py-10 px-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="flex items-center justify-center py-10">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Failed to load request quotes
              </h3>
              <p className="text-red-600 mb-4">
                There was an error loading your request quotes. Please try again.
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Request Quotes</h1>
        <p className="text-muted-foreground">
          Track and manage your quote requests
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Status Filter */}
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {
        requestQuotes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No request quotes found</h2>
              <p className="text-muted-foreground mb-6">
                {status !== "all" || type !== "all" || searchQuery
                  ? "No quotes match your current filters."
                  : "You haven't submitted any quote requests yet."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/request-quote">Submit New Request</Link>
                </Button>
                {(status !== "all" || type !== "all" || searchQuery) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatus("all");
                      setType("all");
                      setSearchQuery("");
                      setPage(1);
                      router.push("/my-request-quotes");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {requestQuotes.length} of {data?.totalItems || 0} results
              </p>
              <Button asChild size="sm">
                <Link href="/request-quote">
                  <FileText className="h-4 w-4 mr-2" />
                  New Request
                </Link>
              </Button>
            </div>

            {/* Request Quotes List */}
            <div className="space-y-4">
              {requestQuotes.map((quote: any) => (
                <Card key={quote.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left side - Main info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm">
                              {quote.type === "product" ? "Product Quote" : "Custom Quote"}
                            </h3>
                            <div className="h-4 w-px bg-border"></div>
                            <p className="text-sm text-muted-foreground">
                              Request #{quote.id.slice(-8).toUpperCase()}
                            </p>
                          </div>
                          <StatusBadge status={quote.status} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Submitted: {formatOrderDate(quote.createdAt)}</span>
                          </div>

                          {quote.type === "product" && quote.productDetails && (
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Qty: {quote.productDetails.quantity}
                                {quote.productDetails.productId?.name &&
                                  ` - ${quote.productDetails.productId.name}`
                                }
                              </span>
                            </div>
                          )}

                          {quote.quotedPrice && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-green-600">
                                Quoted: {formatPrice(quote.quotedPrice)}
                              </span>
                            </div>
                          )}

                          {quote.needDeliveryBy && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Needed by: {formatOrderDate(quote.needDeliveryBy)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Preview content */}
                        {quote.type === "custom" && quote.customRequest?.customNeed && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm">
                              {quote.customRequest.customNeed.length > 150
                                ? `${quote.customRequest.customNeed.substring(0, 150)}...`
                                : quote.customRequest.customNeed
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/my-request-quotes/${quote.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

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
        )
      }
    </div >
  );
}