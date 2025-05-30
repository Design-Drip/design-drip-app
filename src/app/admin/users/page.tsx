import * as React from "react"
import { Users, UserCheck, UserX, Eye } from "lucide-react"
import { clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import type { User } from "@clerk/nextjs/server"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { TableUsers } from "@/features/admin/components/TableUsers"
import { checkRole } from "@/lib/roles"

export interface ClerkUser {
    id: string
    email: string
    firstName?: string
    lastName?: string
    fullName: string
    imageUrl?: string
    isActive: boolean
    lastSignInAt?: number | null
    createdAt: number
    updatedAt: number
    role?: string
}

export default async function UsersManagementPage({
    searchParams,
}: {
    searchParams: { search?: string; status?: string }
}) {
    // Verify admin access
    const isAdmin = await checkRole("admin")
    if (!isAdmin) {
        redirect("/")
    }

    // Get the search and status parameters
    const searchTerm = searchParams.search || ""
    const statusFilter = searchParams.status || "all"

    // Fetch users from Clerk
    const client = await clerkClient()
    const clerkUsersResponse = await client.users.getUserList({ limit: 100 })
    const clerkUsersList = clerkUsersResponse.data

    // Transform Clerk users to our format
    const users: ClerkUser[] = clerkUsersList.map((user: User) => {
        const primaryEmail = user.emailAddresses.find(
            (email: any) => email.id === user.primaryEmailAddressId
        )?.emailAddress || ""

        return {
            id: user.id,
            email: primaryEmail,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || primaryEmail,
            imageUrl: user.imageUrl,
            isActive: !user.banned,
            lastSignInAt: user.lastSignInAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            role: (user.publicMetadata.role as string) || ""
        }
    })

    // Filter users based on search term and status
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            !searchTerm ||
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && user.isActive) ||
            (statusFilter === "inactive" && !user.isActive) ||
            (statusFilter === "admin" && user.role === "admin") ||
            (statusFilter === "user" && user.role === "user")

        return matchesSearch && matchesStatus
    })

    // Stats
    const stats = {
        total: users.length,
        active: users.filter(user => user.isActive).length,
        admin: users.filter(user => user.role === "admin").length,
        users: users.filter(user => user.role === "user" || !user.role).length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User management</h1>
                    <p className="text-muted-foreground">
                        Manage your users, roles, and permissions from this page.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total user</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">Total user</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}% total
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admin</CardTitle>
                        <Eye className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.admin}</div>
                        <p className="text-xs text-muted-foreground">User has admin rights</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">User</CardTitle>
                        <UserX className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                        <p className="text-xs text-muted-foreground">Normal user</p>
                    </CardContent>
                </Card>
            </div>

            {/* User Management Section */}
            <Card>
                <CardContent className="pt-6">
                    {/* Search form */}
                    <div className="mb-6">
                        <form className="flex gap-4" action="/admin/users">
                            <input
                                type="text"
                                name="search"
                                placeholder="Find by name or email..."
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
                                defaultValue={searchTerm}
                            />
                            <select
                                name="status"
                                defaultValue={statusFilter}
                                className="flex h-9 w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors"
                            >
                                <option value="all">All role</option>
                                <option value="normalUser">Normal User</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary text-sm font-medium text-primary-foreground shadow h-9 px-4 py-2"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                    {/* User Table */}
                    <TableUsers staff={filteredUsers} />
                </CardContent>
            </Card>
        </div>
    )
}
