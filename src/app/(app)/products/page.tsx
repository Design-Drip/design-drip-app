"use client";

import { useQuery } from "@tanstack/react-query";
import { FilterSidebar } from "@/components/filter/FilterSidebar";
import { ProductGrid } from "@/components/products/ProductGrid";
import { getProductsQuery } from "@/features/products/services/queries";
import { useProductsQueryStore } from "@/features/products/store/useProductsQueryStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ProductSort } from "@/constants/sort";

function ProductsPage() {
  // Get store state and actions
  const { sort, page, limit, setSort, setPage, setLimit } =
    useProductsQueryStore();

  // Fetch products based on filter/sort state
  const { data, isLoading, isError, refetch } = useQuery(getProductsQuery());

  // Handle sorting change
  const handleSortChange = (value: string) => {
    setSort(value as any);
  };

  // Calculate pagination
  const totalPages = data ? Math.ceil(data.totalItems / data.pageSize) : 0;
  const paginationItems = [];

  if (totalPages > 0) {
    // Always show first page
    paginationItems.push(1);

    // Add ellipsis if needed
    if (page > 3) {
      paginationItems.push("ellipsis");
    }

    // Add pages around current page
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      paginationItems.push(i);
    }

    // Add ellipsis if needed
    if (page < totalPages - 2) {
      paginationItems.push("ellipsis");
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      paginationItems.push(totalPages);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 lg:w-72 shrink-0">
          <FilterSidebar />
        </div>

        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Design Your Own T-Shirt</h1>
            <p className="text-gray-600">
              Choose from our wide range of styles and colors
            </p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-500">
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading products...</span>
                </div>
              ) : (
                <>
                  Showing{" "}
                  <span className="font-medium">
                    {data?.items?.length || 0}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{data?.totalItems || 0}</span>{" "}
                  products
                </>
              )}
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-2">Sort by:</span>
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProductSort[0]}>Newest</SelectItem>
                  <SelectItem value={ProductSort[1]}>Oldest</SelectItem>
                  <SelectItem value={ProductSort[2]}>
                    Price: High to Low
                  </SelectItem>
                  <SelectItem value={ProductSort[3]}>
                    Price: Low to High
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading products...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-red-500 mb-4">
                Failed to load products. Please try again.
              </p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          ) : data?.items?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-500">
                No products found matching your criteria.
              </p>
              <Button
                onClick={() => useProductsQueryStore.getState().resetFilters()}
                className="mt-4"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <ProductGrid products={data?.items || []} />

              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                    />
                  </PaginationItem>

                  {paginationItems.map((pageNumber, index) =>
                    pageNumber === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <span className="flex h-9 w-9 items-center justify-center">
                          ...
                        </span>
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={`page-${pageNumber}`}>
                        <PaginationLink
                          isActive={page === pageNumber}
                          onClick={() => setPage(pageNumber as number)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
