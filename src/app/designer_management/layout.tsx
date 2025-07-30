"use client";

import SidebarLayout from "@/components/layout/SidebarLayout";
import { SidebarConfig } from "@/types/sidebar";
import {
  BarChart3,
  Database,
  FileText,
  HelpCircle,
  Home,
  Images,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Tickets,
  Users,
  Palette,
  MessageSquare,
} from "lucide-react";
import type React from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function DesignerManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  // Create sidebar config with dynamic active states based on current path
  const designerSidebarConfig: SidebarConfig = {
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
            title: "Dashboard",
            url: "/designer_management",
            icon: BarChart3,
            isActive: pathname === "/designer_management",
          },
        ],
      },
      {
        title: "Design Management",
        items: [
          {
            title: "Assigned Quotes",
            url: "/designer_management/assigned-quotes",
            icon: MessageSquare,
            isActive:
              pathname === "/designer_management/assigned-quotes" ||
              pathname?.startsWith("/designer_management/assigned-quotes/"),
          },
          {
            title: "Saved Designs",
            url: "/designer_management/my-designs",
            icon: Palette,
            isActive:
              pathname === "/designer_management/my-designs" ||
              pathname?.startsWith("/designer_management/my-designs/"),
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
    <SidebarLayout sidebarConfig={designerSidebarConfig} onLogout={handleLogout}>
      {children}
    </SidebarLayout>
  );
} 