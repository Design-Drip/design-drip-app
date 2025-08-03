"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { SidebarConfig } from "@/types/sidebar";
import {
  BarChart3,
  Database,
  FileText,
  HelpCircle,
  Home,
  Images,
  MessageSquareQuote,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Tickets,
  Users,
  WalletCards,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  // Create sidebar config with dynamic active states based on current path
  const adminSidebarConfig: SidebarConfig = {
    user: {
      name: user?.fullName || "User",
      email: user?.primaryEmailAddress?.emailAddress || "user@example.com",
      avatar: user?.imageUrl || "/placeholder.svg?height=32&width=32",
      role: (user?.publicMetadata?.role as string) || "User",
    },
    menuGroups: [
      {
        title: "Overview",
        items: [
          {
            title: "Analytics",
            url: "/admin",
            icon: BarChart3,
            isActive: pathname === "/admin",
          },
        ],
      },

      {
        title: "Management",
        items: [
          {
            title: "Users",
            url: "/admin/users",
            icon: Users,
            isActive:
              pathname === "/admin/users" ||
              pathname.startsWith("/admin/users/"),
          },
          {
            title: "Products",
            url: "/admin/products",
            icon: Package,
            isActive:
              pathname === "/admin/products" ||
              pathname.startsWith("/admin/products/"),
          },
          {
            title: "Orders",
            url: "/admin/orders",
            icon: ShoppingCart,
            isActive:
              pathname === "/admin/orders" ||
              pathname.startsWith("/admin/orders/"),
          },
          {
            title: "Design template",
            url: "/admin/design-template",
            icon: Images,
            isActive:
              pathname === "/admin/design-template" ||
              pathname?.startsWith("/admin/design-template/"),
          },
          {
            title: "Request quotes",
            url: "/admin/request-quotes",
            icon: MessageSquareQuote,
            isActive:
              pathname === "/admin/request-quotes" ||
              pathname.startsWith("/admin/request-quotes/"),
          },
          {
            title: "Transactions",
            url: "/admin/transactions",
            icon: WalletCards,
            isActive:
              pathname === "/admin/transactions" ||
              pathname.startsWith("/admin/transactions/"),
          },
        ],
      },
    ],
  };

  return (
    <SidebarLayout sidebarConfig={adminSidebarConfig}>{children}</SidebarLayout>
  );
}
