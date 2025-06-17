import React from "react";
import Link from "next/link";
import {
  Home,
  Package,
  Tag,
  Users,
  Settings,
  LayoutDashboard,
  ShoppingCart,
  Palette,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminNavigationProps {
  currentPage: string;
  backLink?: {
    href: string;
    label: string;
  };
  productId?: string;
}

export function AdminNavigation({
  currentPage,
  backLink,
  productId,
}: AdminNavigationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentPage === "dashboard" ? "default" : "outline"}
          asChild
          size="sm"
        >
          <Link href="/admin">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button
          variant={currentPage === "products" ? "default" : "outline"}
          asChild
          size="sm"
        >
          <Link href="/admin/products">
            <Package className="mr-2 h-4 w-4" />
            Products
          </Link>
        </Button>
        <Button
          variant={currentPage === "categories" ? "default" : "outline"}
          asChild
          size="sm"
        >
          <Link href="/admin/products?tab=categories">
            <Tag className="mr-2 h-4 w-4" />
            Categories
          </Link>
        </Button>
        <Button
          variant={currentPage === "orders" ? "default" : "outline"}
          asChild
          size="sm"
        >
          <Link href="/admin/orders">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Orders
          </Link>
        </Button>
        <Button
          variant={currentPage === "users" ? "default" : "outline"}
          asChild
          size="sm"
        >
          <Link href="/admin/users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </Link>
        </Button>
      </div>

      {productId && (
        <div className="text-sm text-muted-foreground hidden md:block">
          Product ID: <span className="font-mono">{productId}</span>
        </div>
      )}

      {backLink && (
        <Button variant="outline" asChild>
          <Link href={backLink.href}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLink.label}
          </Link>
        </Button>
      )}
    </div>
  );
}
