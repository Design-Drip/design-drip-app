"use client"

import { FilterSidebar } from '@/components/filter/FilterSidebar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { getProductsQuery } from '@/features/products/services/queries'
import { useProductsQueryStore } from '@/features/products/store/useProductsQueryStore'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import React from 'react'
import ProductList from '../ProductList'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'

const SelectShirtDialog = () => {
    //Get store state and actions
    const { sort, page, setSort, setPage } = useProductsQueryStore();

    //Fetch products based on filter/sort state
    const { data, isLoading, isError, refetch } = useQuery(getProductsQuery());

    //Caculate pagination
    const totalPages = data ? Math.ceil(data.totalItems / data.pageSize) : 0;
    const paginationItems = [];

    if (totalPages > 0) {
        //Always show first page
        paginationItems.push(1);

        //Add ellipsis if needed
        if (page > 3) {
            paginationItems.push("ellipsis");
        }

        //Add pages around current page
        for (
            let i = Math.max(2, page - 1);
            i <= Math.min(totalPages - 1, page + 1);
            i++
        ) {
            paginationItems.push(i);
        }

        //Add ellipsis if needed
        if (page < totalPages - 2) {
            paginationItems.push("ellipsis");
        }

        //Always show last page if there is more than one page
        if (totalPages > 1) {
            paginationItems.push(totalPages);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    OPEN PRODUCT SELECTOR
                </Button>
            </DialogTrigger>
            <DialogContent className='max-w-0 h-[80vh] flex flex-col' style={{ height: '90vh', width: '90vw' }}>
                <DialogHeader className="flex-shrink-0">
                    <h2 className="text-lg font-semibold">Select Product</h2>
                </DialogHeader>
                <div className='flex gap-4 flex-1 h-full' style={{ paddingBottom: '26px' }}>
                    <div className="flex-shrink-0">
                        <FilterSidebar />
                    </div>
                    <div className="flex flex-col min-h-0">
                        {isLoading ? (
                            <div className="flex justify-center items-center flex-1">
                                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                                <span>Loading products...</span>
                            </div>
                        ) : isError ? (
                            <div className="flex flex-col items-center justify-center flex-1">
                                <p className="text-red-500 mb-4">
                                    Failed to load products. Please try again.
                                </p>
                                <Button onClick={() => refetch()}>Retry</Button>
                            </div>
                        ) : data?.items?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center flex-1">
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
                                <div className="flex-1 overflow-y-auto min-h-0">
                                    <ProductList products={data?.items || []} />
                                </div>

                                <div className="flex-shrink-0 border-t pt-4">
                                    <Pagination>
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
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default SelectShirtDialog