"use client";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Layers,
  Box,
} from "lucide-react";
import { useState, useTransition, useMemo, useEffect } from "react";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import Product type
import type { Product } from "@/app/admin/products/page";
import { ProductDetailsDialog } from "./ProductDetailsDialog";
import { EditProductForm } from "./EditProductForm";
// Import the action functions
import {
  toggleProductStatus,
  deleteProduct,
} from "@/app/admin/products/_actions";
// Import pagination components
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getCategories } from "@/app/admin/categories/_actions"; // Thêm import getCategories

interface ProductTableProps {
  products: Product[];
}

export function TableProducts({ products }: ProductTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  // Add state to store categories list
  const [allCategories, setAllCategories] = useState<
    { id: string; name: string }[]
  >([]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setAllCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array to run once on mount

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate total pages
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // Get current page data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage, itemsPerPage]);

  // Page changing handler
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);

      // Calculate start and end of middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        startPage = 2;
        endPage = 4;
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push("ellipsis-start");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      // Always include last page
      pages.push(totalPages);
    }

    return pages;
  };
  const formatDate = (timestamp: number | undefined | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US");
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setDetailsOpen(true);
  };

  // Cải thiện hàm handleEditProduct để truyền thông tin chính xác
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditOpen(true);
  };

  const handleToggleStatus = (productId: string, isActive: boolean) => {
    const formData = new FormData();
    formData.append("id", productId);
    formData.append("isActive", isActive.toString());

    startTransition(async () => {
      await toggleProductStatus(formData);
      router.refresh();
    });
  };

  const handleDeleteConfirm = (productId: string) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProduct = () => {
    if (!productToDelete) return;

    const formData = new FormData();
    formData.append("id", productToDelete);

    startTransition(async () => {
      await deleteProduct(formData);
      setDeleteDialogOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((product) => (
                <TableRow
                  key={product.id}
                  className={isPending ? "opacity-60" : ""}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium">{product.name}</div>
                      {product.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.categories.map((cat, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground mt-1">
                          Does not belong to any category
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(product.default_price)}</TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(product.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(product)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditProduct(product)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.id}/variants`}>
                            <Layers className="mr-2 h-4 w-4" />
                            Manage Variants
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/products/${product.id}/inventory`}
                          >
                            <Box className="mr-2 h-4 w-4" />
                            Manage Inventory
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={isPending}
                          onClick={() =>
                            handleToggleStatus(product.id, product.isActive)
                          }
                        >
                          {product.isActive ? (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Set Inactive
                            </>
                          ) : (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Set Active
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={isPending}
                          onClick={() => handleDeleteConfirm(product.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-10 w-10 text-muted-foreground opacity-20" />
                    <h3 className="font-medium mt-2">No products found</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      No products match your search criteria. Try adjusting your
                      filters or add a new product.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {products.length > itemsPerPage && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {getPaginationNumbers().map((page, index) => {
                if (page === "ellipsis-start" || page === "ellipsis-end") {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={index}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => handlePageChange(page as number)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        product={selectedProduct}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      {/* Edit Product Form - Sửa cách tạo initialData */}
      {selectedProduct && (
        <EditProductForm
          productId={selectedProduct.id}
          initialData={{
            name: selectedProduct.name,
            description: selectedProduct.description || "",
            default_price: selectedProduct.default_price,
            isActive: selectedProduct.isActive,
            categories: selectedProduct.categories.map((categoryName) => {
              // Find category based on name
              const foundCategory = allCategories.find(
                (cat) => cat.name === categoryName
              );

              // If not found, create object with id as name to ensure there's always a value
              return (
                foundCategory || {
                  id: categoryName, // Use name as ID if no match is found
                  name: categoryName,
                }
              );
            }),
          }}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
