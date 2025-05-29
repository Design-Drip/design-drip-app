"use client";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useState, useTransition, useMemo } from "react";

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

// Import Product type
import type { Product } from "@/app/admin/products/page";
import { ProductDetailsDialog } from "./ProductDetailsDialog";
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

interface ProductTableProps {
  products: Product[];
}

export function TableProducts({ products }: ProductTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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
    return new Date(timestamp).toLocaleDateString("vi-VN");
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

  const handleToggleStatus = (productId: string, isActive: boolean) => {
    const formData = new FormData();
    formData.append("id", productId);
    formData.append("isActive", isActive.toString());

    startTransition(async () => {
      await toggleProductStatus(formData);
      router.refresh();
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      const formData = new FormData();
      formData.append("id", productId);

      startTransition(async () => {
        await deleteProduct(formData);
        router.refresh();
      });
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
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
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {product.description || "Không có mô tả"}
                      </div>
                      <div className="flex gap-1 mt-1">
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
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(product.default_price)}</TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Đang bán" : "Ngừng bán"}
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
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(product)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>{" "}
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(product)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
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
                              Dừng bán
                            </>
                          ) : (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Khôi phục
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={isPending}
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa sản phẩm
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Eye className="h-8 w-8 text-muted-foreground" />
                    <h3 className="font-medium">Không tìm thấy sản phẩm</h3>
                    <p className="text-sm text-muted-foreground">
                      Không tìm thấy sản phẩm nào phù hợp với tiêu chí tìm kiếm.
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
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
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
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        product={selectedProduct}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
}
