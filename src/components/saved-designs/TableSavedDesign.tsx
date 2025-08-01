"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrderModal } from "@/components/orders/OrderModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, ShoppingCart, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import {DeleteDesignDialog} from "./DeleteDesignDialog";

export const TableSavedDesign = ({
  data,
  onDelete,
  onConfirmDelete,
  deleteLoading,
  confirmModalOpen,
  onConfirmModalOpen,
  displayActionMenu,
}: {
  data: Array<{
    id: string;
    colorId: string;
    productId: string;
    productName: string;
    designName: string;
    previewImages: Array<{
      view: string;
      url: string;
    }>[];
    isVersion?: boolean;
    version?: string;
    parentDesignName?: string;
    createdAt?: string;
  }>;
  onDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  deleteLoading?: boolean;
  confirmModalOpen: boolean;
  onConfirmModalOpen: (open: boolean) => void;
  displayActionMenu: boolean;
}) => {
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<{
    id: string;
    designName: string;
    colorId: string;
  } | null>(null);
  const [deleteDesignId, setDeleteDesignId] = useState<string | null>(null);

  // Sort state
  const [sortField, setSortField] = useState<
    "productName" | "designName" | null
  >(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: "productName" | "designName") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = sortField === "productName" ? a.productName : a.designName;
    const bValue = sortField === "productName" ? b.productName : b.designName;

    const comparison = aValue.localeCompare(bValue);
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const handleOrderClick = (
    id: string,
    designName: string,
    colorId: string
  ) => {
    setSelectedDesign({ id, designName, colorId });
    setOrderModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteDesignId(id);
    onDelete(id);
  };

  const renderActions = (item: {
    id: string;
    colorId: string;
    productId: string;
    designName: string;
    version?: string;
    createdAt?: string;
  }) => {
    if (displayActionMenu) {
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              style={{
                zIndex: 10001,
              }}
            >
              {item.productId && item.colorId ? (
                <DropdownMenuItem asChild>
                  <Link
                    href={`/designer/${item.productId}?colorId=${item.colorId}&designId=${item.id}`}
                    className="flex items-center cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled className="flex items-center cursor-not-allowed">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit (No product data)
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() =>
                  handleOrderClick(item.id, item.designName, item.colorId)
                }
                className="flex items-center cursor-pointer"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Order
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(item.id)}
                className="flex items-center text-destructive cursor-pointer"
                disabled={deleteLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteLoading && deleteDesignId === item.id
                  ? "Deleting..."
                  : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {confirmModalOpen && deleteDesignId === item.id && (
            <DeleteDesignDialog
              design={{
                id: item.id,
                name: item.designName,
                version: item.version || "original",
                createdAt: item.createdAt || new Date().toISOString(),
                design_images: {}
              }}
              open={confirmModalOpen}
              onOpenChange={onConfirmModalOpen}
            />
          )}
        </>
      );
    } else {
      return (
        <div className="flex justify-end gap-2">
          {item.productId && item.colorId ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/designer/${item.productId}?colorId=${item.colorId}&designId=${item.id}`}
                onClick={() => {
                  console.log("Edit button clicked for design:", {
                    designId: item.id,
                    designName: item.designName,
                    productId: item.productId,
                    colorId: item.colorId,
                    fullURL: `/designer/${item.productId}?colorId=${item.colorId}&designId=${item.id}`,
                  });
                }}
              >
                Edit
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Edit (No product data)
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() =>
              handleOrderClick(item.id, item.designName, item.colorId)
            }
          >
            Order
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteClick(item.id)}
            disabled={deleteLoading}
          >
            {deleteLoading && deleteDesignId === item.id
              ? "Deleting..."
              : "Delete"}
          </Button>

          {confirmModalOpen && deleteDesignId === item.id && (
            <DeleteDesignDialog
              design={{
                id: item.id,
                name: item.designName,
                version: item.version || "original",
                createdAt: item.createdAt || new Date().toISOString(),
                design_images: {}
              }}
              open={confirmModalOpen}
              onOpenChange={onConfirmModalOpen}
            />
          )}
        </div>
      );
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px] font-bold text-black text-base">
              Preview
            </TableHead>
            <TableHead className="font-bold text-black text-base">
              <Button
                variant="ghost"
                className="p-0 h-auto font-bold text-black text-base hover:bg-transparent"
                onClick={() => handleSort("productName")}
              >
                Product Name
                {sortField === "productName" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </Button>
            </TableHead>
            <TableHead className="font-bold text-black text-base">
              <Button
                variant="ghost"
                className="p-0 h-auto font-bold text-black text-base hover:bg-transparent"
                onClick={() => handleSort("designName")}
              >
                Design Name
                {sortField === "designName" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </Button>
            </TableHead>
            <TableHead className="font-bold text-black text-base">
              Version Info
            </TableHead>
            <TableHead className="text-right font-bold text-black text-base">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => {
            // Get all images (flattened)
            const allImages = item.previewImages.flat();

            return (
              <TableRow key={item.id}>
                <TableCell>
                  {allImages.length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto">
                      {allImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative w-20 h-20 rounded-md overflow-hidden"
                        >
                          <Image
                            src={img.url}
                            alt={`Design view ${img.view}`}
                            fill
                            className="object-contain"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-0.5 text-center">
                            View {img.view}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                      No preview
                    </div>
                  )}
                </TableCell>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.designName}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div
                      className={`font-medium ${
                        item.version === "original"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      {item.version === "original"
                        ? "Original"
                        : item.version?.toUpperCase()}
                    </div>
                    {item.isVersion && item.parentDesignName && (
                      <div className="text-gray-500 text-xs">
                        Based on: {item.parentDesignName}
                      </div>
                    )}
                    {item.createdAt && (
                      <div className="text-gray-400 text-xs">
                        At: {formatDate(item.createdAt)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {renderActions(item)}
                </TableCell>
              </TableRow>
            );
          })}

          {sortedData.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No saved designs found. Start creating your first design!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedDesign && (
        <OrderModal
          open={orderModalOpen}
          onOpenChange={setOrderModalOpen}
          designId={selectedDesign.id}
          designName={selectedDesign.designName}
          colorId={selectedDesign.colorId}
          mode="add"
        />
      )}
    </>
  );
};
