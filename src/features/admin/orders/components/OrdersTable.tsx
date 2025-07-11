"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, MoreHorizontal, Package } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { formatOrderDate } from "@/lib/date";
import { formatPrice } from "@/lib/price";

interface OrderItem {
  designId: string;
  name: string;
  color: string;
  sizes: {
    size: string;
    quantity: number;
    pricePerUnit: number;
  }[];
  totalPrice: number;
  imageUrl?: string;
}

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled";

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
}

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const getItemsPreview = (items: OrderItem[]) => {
    if (items.length === 0) return "No items";
    if (items.length === 1) return items[0].name;
    return `${items[0].name} + ${items.length - 1} more`;
  };

  const getTotalQuantity = (items: OrderItem[]) => {
    return items.reduce((total, item) => {
      return (
        total +
        item.sizes.reduce(
          (itemTotal, size) => itemTotal + size.quantity,
          0
        )
      );
    }, 0);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="hover:underline text-blue-600"
                >
                  #{order.id}
                </Link>
              </TableCell>

              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{order.userId}</div>
                  <div className="text-muted-foreground text-xs">
                    User ID: {order.userId.slice(-8)}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  {order.items[0]?.imageUrl ? (
                    <img
                      src={order.items[0].imageUrl}
                      alt={order.items[0].name}
                      className="w-8 h-8 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground" />
                  )}
                  <div className="text-sm">
                    <div className="font-medium truncate max-w-[200px]">
                      {getItemsPreview(order.items)}
                    </div>
                    {order.items.length > 1 && (
                      <div className="text-xs text-muted-foreground">
                        {order.items.length} items total
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {getTotalQuantity(order.items)} pcs
                </Badge>
              </TableCell>

              <TableCell className="font-medium">
                {formatPrice(order.totalAmount)}
              </TableCell>

              <TableCell>
                <Select value={order.status} disabled={true}>
                  <SelectTrigger className="w-[130px] h-8">
                    <SelectValue>
                      <OrderStatusBadge status={order.status} />
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <OrderStatusBadge status="pending" />
                    </SelectItem>
                    <SelectItem value="processing">
                      <OrderStatusBadge status="processing" />
                    </SelectItem>
                    <SelectItem value="shipped">
                      <OrderStatusBadge status="shipped" />
                    </SelectItem>
                    <SelectItem value="delivered">
                      <OrderStatusBadge status="delivered" />
                    </SelectItem>
                    <SelectItem value="canceled">
                      <OrderStatusBadge status="canceled" />
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>

              <TableCell>
                <Badge
                  variant="outline"
                  className="text-xs capitalize"
                >
                  {order.paymentMethod}
                </Badge>
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {formatOrderDate(order.createdAt)}
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
