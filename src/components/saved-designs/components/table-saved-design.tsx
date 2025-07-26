"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { ChevronUp, ChevronDown } from "lucide-react";

export const TableSavedDesign = ({
  data,
  onDelete,
  onConfirmDelete,
  deleteLoading,
  onConfirmModalOpen,

  confirmModalOpen,
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
  onConfirmModalOpen: (open: boolean) => void;
  confirmModalOpen: boolean;
}) => {
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<{
    id: string;
    designName: string;
    colorId: string;
  } | null>(null);

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

  const handleOrderClick = (id: string, designName: string, colorId: string) => {
    setSelectedDesign({ id, designName, colorId });
    setOrderModalOpen(true);
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
                  <div className="flex justify-end gap-2">
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
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        handleOrderClick(item.id, item.designName, item.colorId)
                      }
                    >
                      Order
                    </Button>
                    <Dialog>
                      <DialogTrigger>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(item.id)}
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? "Deleting..." : "Delete"}
                        </Button>
                      </DialogTrigger>
                      {confirmModalOpen && (
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will
                              permanently delete your design and remove your
                              design from your cart.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="sm:justify-end">
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Close
                              </Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onConfirmDelete(item.id)}
                              disabled={deleteLoading}
                            >
                              {deleteLoading ? "Loading..." : "Confirm"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                  </div>
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
