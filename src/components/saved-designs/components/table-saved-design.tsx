import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const TableSavedDesign = ({
  invoices,
}: {
  invoices: Array<{
    invoice: string;
    paymentStatus: string;
    totalAmount: string;
    paymentMethod: string;
  }>;
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px] font-bold text-black text-base">
            Product
          </TableHead>
          <TableHead className="font-bold text-black text-base">
            Product Name
          </TableHead>
          <TableHead className="font-bold text-black text-base">
            Design Name
          </TableHead>
          <TableHead className="text-right font-bold text-black text-base">
            Options
          </TableHead>
          <TableHead className="text-right font-bold text-black text-base">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
