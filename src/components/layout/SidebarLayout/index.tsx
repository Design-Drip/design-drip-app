import * as React from "react"
import {
    Breadcrumb,
    BreadcrumbItem as UIBreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type { SidebarConfig } from "@/types/sidebar"
import AppSidebar from "@/components/AppSidebar"
import { usePathname } from "next/navigation"

interface SidebarLayoutProps {
    children: React.ReactNode
    sidebarConfig: SidebarConfig
    breadcrumbs?: { title: string; href?: string }[]
}

export function SidebarLayout({ children, sidebarConfig, breadcrumbs = [] }: SidebarLayoutProps) {
    const pathname = usePathname();
    const isEditorPage = pathname?.includes('/designer-editor');
    
    return (
        <SidebarProvider>
            <AppSidebar config={sidebarConfig} />
            <SidebarInset>
                {!isEditorPage && (
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            {breadcrumbs.length > 0 && (
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        {breadcrumbs.map((item, index) => (
                                            <React.Fragment key={index}>
                                                {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                                                <UIBreadcrumbItem className="hidden md:block">
                                                    {item.href ? (
                                                        <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
                                                    ) : (
                                                        <BreadcrumbPage>{item.title}</BreadcrumbPage>
                                                    )}
                                                </UIBreadcrumbItem>
                                            </React.Fragment>
                                        ))}
                                    </BreadcrumbList>
                                </Breadcrumb>
                            )}
                        </div>
                    </header>
                )}
                <div className={`flex flex-1 flex-col ${isEditorPage ? '' : 'gap-4 p-4 pt-0'}`}>{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}
export default SidebarLayout