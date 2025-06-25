import React from "react";
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

export const TableSavedDesign = ({
  data,
  onDelete,
  deleteLoading,
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
  deleteLoading?: boolean;
}) => {
  return (
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
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/designer/${item.productId}?colorId=${item.colorId}&designId=${item.id}`}
                    >
                      Edit
                    </Link>
                  </Button>
                  <Button variant="default" size="sm">
                    Order
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </Button>
                </div>
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
  );
};
