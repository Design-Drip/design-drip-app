import type { LucideIcon } from "lucide-react";

export interface MenuItem {
    title: string;
    url: string;
    icon: LucideIcon;
    badge?: string;
    isActive?: boolean;
}

export interface MenuGroup {
    title: string;
    items: MenuItem[];
}

export interface SidebarConfig {
    user: {
        name: string;
        avatar: string;
        email: string;
        role: string;
    }
    menuGroups: MenuGroup[];
    footer?: MenuItem[];
}