"use client"
import { Eye, MoreHorizontal, User, ShieldCheck, Shield } from "lucide-react"
import { useState, useTransition } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

// Import ClerkUser type and UserDetailDialog component
import type { ClerkUser } from "@/app/admin/users/page"
import { UserDetailsDialog } from "./UserDetailDialog"
// Import the action functions
import { setRole, removeRole } from "@/app/admin/users/_actions"

interface UserTableProps {
    staff: ClerkUser[]
}

export function TableUsers({ staff }: UserTableProps) {
    const [selectedUser, setSelectedUser] = useState<ClerkUser | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const formatDate = (timestamp: number | undefined | null) => {
        if (!timestamp) return "N/A"
        return new Date(timestamp).toLocaleDateString("vi-VN")
    }

    const handleViewDetails = (user: ClerkUser) => {
        setSelectedUser(user)
        setDetailsOpen(true)
    }

    const handleSetRole = (userId: string, role: string) => {
        const formData = new FormData()
        formData.append("id", userId)
        formData.append("role", role)

        startTransition(async () => {
            await setRole(formData)
            router.refresh()
        })
    }

    const handleRemoveRole = (userId: string) => {
        const formData = new FormData()
        formData.append("id", userId)

        startTransition(async () => {
            await removeRole(formData)
            router.refresh()
        })
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Người dùng</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Đăng nhập cuối</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead>Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staff.length > 0 ? (
                            staff.map((user) => (
                                <TableRow key={user.id} className={isPending ? "opacity-60" : ""}>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.imageUrl || "/placeholder.svg"} alt={user.fullName} />
                                                <AvatarFallback>
                                                    {user.firstName?.[0] || ""}
                                                    {user.lastName?.[0] || ""}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div style={{ marginLeft: 10 }}>
                                                <div className="font-medium">{user.fullName}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                            {user.role ? user.role : "Người dùng"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={user.isActive ? "default" : "secondary"}>
                                                {user.isActive ? "Hoạt động" : "Tạm dừng"}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.lastSignInAt ? (
                                            <div className="text-sm">{formatDate(user.lastSignInAt)}</div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Chưa đăng nhập</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{formatDate(user.createdAt)}</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Mở menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Xem thông tin
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuLabel>Quyền hạn</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    disabled={isPending}
                                                    onClick={() => handleSetRole(user.id, "admin")}
                                                >
                                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                                    Đặt làm Admin
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    disabled={isPending}
                                                    onClick={() => handleSetRole(user.id, "staff")}
                                                >
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    Đặt làm Staff
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    disabled={isPending}
                                                    onClick={() => handleRemoveRole(user.id)}
                                                >
                                                    <User className="mr-2 h-4 w-4" />
                                                    Xóa vai trò
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <div className="flex flex-col items-center gap-2">
                                        <User className="h-8 w-8 text-muted-foreground" />
                                        <h3 className="font-medium">Không tìm thấy người dùng</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Không tìm thấy người dùng phù hợp với tiêu chí tìm kiếm.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* User Details Dialog */}
            <UserDetailsDialog
                staff={selectedUser}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />
        </>
    )
}
