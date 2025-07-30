"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { 
  Palette, 
  BarChart3, 
  MessageSquare, 
  Image as ImageIcon,
  Settings,
  Home
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function DesignerNavigation() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Check if user has designer role
  const isDesigner = user?.publicMetadata?.role === "designer";
  const isAdmin = user?.publicMetadata?.role === "admin";

  // Only show if user is designer or admin
  if (!isDesigner && !isAdmin) {
    return null;
  }

  const navigationItems = [
    {
      title: "Designer Panel",
      items: [
        {
          title: "Dashboard",
          href: "/designer_management",
          icon: BarChart3,
        },
        {
          title: "Assigned Quotes",
          href: "/designer_management/assigned-quotes",
          icon: MessageSquare,
        },
        {
          title: "Saved Designs",
          href: "/designer_management/my-designs",
          icon: Palette,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Designer Panel</h2>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-6">
        {navigationItems.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/designer_management" && pathname.startsWith(item.href));
                
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "secondary" : "ghost"}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      isActive 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900"
        >
          <Home className="h-4 w-4" />
          Back to Main Site
        </Button>
      </div>
    </div>
  );
} 