"use client"

import SidebarLayout from "@/components/layout/SidebarLayout"
import { SidebarConfig } from "@/types/sidebar"
import { BarChart3, Database, FileText, HelpCircle, Home, Images, MessageSquareQuote, Package, Settings, Shield, ShoppingCart, Tickets, Users } from "lucide-react"
import type React from "react"
import { usePathname } from "next/navigation"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    // Create sidebar config with dynamic active states based on current path
    const adminSidebarConfig: SidebarConfig = {
        user: {
            name: "Nguyễn Văn Admin",
            email: "admin@company.com",
            avatar: "/placeholder.svg?height=32&width=32",
            role: "Admin",
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
                        isActive: pathname === "/admin/users" || pathname.startsWith("/admin/users/"),
                    },
                    {
                        title: "Products",
                        url: "/admin/products",
                        icon: Package,
                        isActive: pathname === "/admin/products" || pathname.startsWith("/admin/products/"),
                    },
                    {
                        title: "Orders",
                        url: "/admin/orders",
                        icon: ShoppingCart,
                        isActive: pathname === "/admin/orders" || pathname.startsWith("/admin/orders/"),
                    },
                    {
                        title: "Reports",
                        url: "/admin/reports",
                        icon: FileText,
                        isActive: pathname === "/admin/reports" || pathname?.startsWith("/admin/reports/"),
                    },
                    {
                        title: "Coupons",
                        url: "/admin/coupons",
                        icon: Tickets,
                        isActive: pathname === "/admin/coupons" || pathname?.startsWith("/admin/coupons/"),
                    },
                    {
                        title: "Design template",
                        url: "/admin/design-template",
                        icon: Images,
                        isActive: pathname === "/admin/design-template" || pathname?.startsWith("/admin/design-template/"),
                    },
                    {
                        title: "Request quotes",
                        url: "/admin/request-quotes",
                        icon: MessageSquareQuote,
                        isActive: pathname === "/admin/request-quotes" || pathname.startsWith("/admin/request-quotes/"),
                    },
                ],
            },
            {
                title: "Systems",
                items: [
                    {
                        title: "Settings",
                        url: "/admin/settings",
                        icon: Settings,
                        isActive: pathname === "/admin/settings" || pathname?.startsWith("/admin/settings/"),
                    },
                ],
            },
        ],
        footer: [
            {
                title: "Support",
                url: "/admin/support",
                icon: HelpCircle,
                isActive: pathname === "/admin/support" || pathname?.startsWith("/admin/support/"),
            },
        ],
    }

    const handleLogout = () => {
        // Handle logout logic here
        console.log("Logout clicked")
    }

    return (
        <SidebarLayout
            sidebarConfig={adminSidebarConfig}
            onLogout={handleLogout}
        >
            {children}
        </SidebarLayout>
    )
}
