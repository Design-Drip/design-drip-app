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
import { MoreVertical, Edit, ShoppingCart, Trash2 } from "lucide-react";
import DeleteDesignDialog from "./DeleteDesignDialog";

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
  } | null>(null);
  const [deleteDesignId, setDeleteDesignId] = useState<string | null>(null);

  const handleOrderClick = (id: string, designName: string) => {
    setSelectedDesign({ id, designName });
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
              <DropdownMenuItem asChild>
                <Link
                  href={`/designer/${item.productId}?colorId=${item.colorId}&designId=${item.id}`}
                  className="flex items-center cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleOrderClick(item.id, item.designName)}
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
              itemId={item.id}
              onConfirmDelete={onConfirmDelete}
              loading={deleteLoading}
              open={confirmModalOpen}
              onOpenChange={onConfirmModalOpen}
            />
          )}
        </>
      );
    } else {
      return (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`/designer/${item.productId}?colorId=${item.colorId}&designId=${item.id}`}
            >
              Edit
            </Link>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleOrderClick(item.id, item.designName)}
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
              itemId={item.id}
              onConfirmDelete={onConfirmDelete}
              loading={deleteLoading}
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
              Product Name
            </TableHead>
            <TableHead className="font-bold text-black text-base">
              Design Name
            </TableHead>
            <TableHead className="text-right font-bold text-black text-base">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
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
                <TableCell className="text-right">
                  {renderActions(item)}
                </TableCell>
              </TableRow>
            );
          })}

          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
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
          mode="add"
        />
      )}
    </>
  );
};
