"use client";

import SidebarLayout from "@/components/layout/SidebarLayout";
import { SidebarConfig } from "@/types/sidebar";
import {
  Package,
  Truck,
  Settings,
} from "lucide-react";
import type React from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function ShipperManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  // Create sidebar config with dynamic active states based on current path
  const shipperSidebarConfig: SidebarConfig = {
    user: {
      name: user?.fullName || "User",
      email: user?.primaryEmailAddress?.emailAddress || "user@example.com",
      avatar: user?.imageUrl || "/placeholder.svg?height=32&width=32",
      role: (user?.publicMetadata?.role as string) || "User",
    },
    menuGroups: [
      {
        title: "Shipping Management",
        items: [
          {
            title: "Shipping Orders",
            url: "/shipper_management/shipping-orders",
            icon: Truck,
            isActive:
              pathname === "/shipper_management/shipping-orders" ||
              pathname?.startsWith("/shipper_management/shipping-orders/"),
          },
          {
            title: "My Orders",
            url: "/shipper_management/my-orders",
            icon: Package,
            isActive:
              pathname === "/shipper_management/my-orders" ||
              pathname?.startsWith("/shipper_management/my-orders/"),
          },
        ],
      },
    ],
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log("Logout clicked");
  };

  return (
    <SidebarLayout sidebarConfig={shipperSidebarConfig} onLogout={handleLogout}>
      {children}
    </SidebarLayout>
  );
} 