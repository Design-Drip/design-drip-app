"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { useRouter } from "next/navigation";

export function DesignerNavigation() {
  const { user } = useUser();
  const router = useRouter();

  // Check if user has designer role
  const isDesigner = user?.publicMetadata?.role === "designer";
  const isAdmin = user?.publicMetadata?.role === "admin";

  // Only show if user is designer or admin
  if (!isDesigner && !isAdmin) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      onClick={() => router.push("/designer_management")}
      className="flex items-center gap-2"
    >
      <Palette className="h-4 w-4" />
      <span className="hidden md:inline">Designer Dashboard</span>
    </Button>
  );
} 