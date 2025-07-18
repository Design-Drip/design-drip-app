"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  Users,
  BarChart3,
  Activity,
  ShoppingCart,
  Settings,
  FileText,
  TrendingUp,
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Manage Products",
      description: "Add, edit, or remove products",
      icon: Package,
      color: "from-blue-500 to-blue-600",
      href: "/admin/products",
    },
    {
      title: "User Management",
      description: "Manage user accounts",
      icon: Users,
      color: "from-green-500 to-green-600",
      href: "/admin/users",
    },
    {
      title: "View Orders",
      description: "Manage customer orders",
      icon: ShoppingCart,
      color: "from-purple-500 to-purple-600",
      href: "/admin/orders",
    },
    {
      title: "Analytics",
      description: "View detailed reports",
      icon: BarChart3,
      color: "from-orange-500 to-orange-600",
      href: "/admin/analytics",
    },
    {
      title: "Settings",
      description: "Configure system settings",
      icon: Settings,
      color: "from-gray-500 to-gray-600",
      href: "/admin/settings",
    },
    {
      title: "Reports",
      description: "Generate business reports",
      icon: FileText,
      color: "from-indigo-500 to-indigo-600",
      href: "/admin/reports",
    },
    {
      title: "Performance",
      description: "Monitor system performance",
      icon: TrendingUp,
      color: "from-pink-500 to-pink-600",
      href: "/admin/performance",
    },
    {
      title: "System Health",
      description: "Monitor system status",
      icon: Activity,
      color: "from-red-500 to-red-600",
      href: "/admin/health",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {actions.map((action, index) => (
        <Card
          key={index}
          className="hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{action.title}</p>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
