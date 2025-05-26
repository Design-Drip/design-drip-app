"use client"

import SidebarLayout from "@/components/layout/SidebarLayout"
import { SidebarConfig } from "@/types/sidebar"
import { BarChart3, Database, FileText, HelpCircle, Home, Package, Settings, Shield, ShoppingCart, Users } from "lucide-react"
import type React from "react"

const adminSidebarConfig: SidebarConfig = {
    user: {
        name: "Nguyễn Văn Admin",
        email: "admin@company.com",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "Quản trị viên",
    },
    menuGroups: [
        {
            title: "Tổng quan",
            items: [
                {
                    title: "Thống kê",
                    url: "/admin",
                    icon: BarChart3,
                },
            ],
        },
        {
            title: "Quản lý",
            items: [
                {
                    title: "Người dùng",
                    url: "/admin/users",
                    icon: Users,
                    badge: "1.2k",
                },
                {
                    title: "Sản phẩm",
                    url: "/admin/products",
                    icon: Package,
                    badge: "234",
                },
                {
                    title: "Đơn hàng",
                    url: "/admin/orders",
                    icon: ShoppingCart,
                    badge: "12",
                },
                {
                    title: "Báo cáo",
                    url: "/admin/reports",
                    icon: FileText,
                },
            ],
        },
        {
            title: "Hệ thống",
            items: [
                {
                    title: "Cài đặt",
                    url: "/admin/settings",
                    icon: Settings,
                },
            ],
        },
    ],
    footer: [
        {
            title: "Hỗ trợ",
            url: "/admin/support",
            icon: HelpCircle,
        },
    ],
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <SidebarLayout
            sidebarConfig={adminSidebarConfig}
        >
            {children}
        </SidebarLayout>
    )
}
