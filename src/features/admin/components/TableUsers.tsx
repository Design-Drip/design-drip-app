"use client";
import { Eye, MoreHorizontal, User, ShieldCheck, Shield, Palette } from "lucide-react";
import { useState, useTransition, useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { RoleBadge } from "@/components/ui/role-badge";

// Import ClerkUser type and UserDetailDialog component
import type { ClerkUser } from "@/app/admin/users/page";
import { UserDetailsDialog } from "./UserDetailDialog";
// Import the action functions
import { setRole, removeRole } from "@/app/admin/users/_actions";
// Import pagination components
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface UserTableProps {
  staff: ClerkUser[];
}

export function TableUsers({ staff }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<ClerkUser | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate total pages
  const totalPages = Math.ceil(staff.length / itemsPerPage);

  // Get current page data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return staff.slice(startIndex, endIndex);
  }, [staff, currentPage, itemsPerPage]);
  // Page changing handler
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);

      // Calculate start and end of middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        startPage = 2;
        endPage = 4;
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push("ellipsis-start");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      // Always include last page
      pages.push(totalPages);
    }

    return pages;
  };

  const formatDate = (timestamp: number | undefined | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("vi-VN");
  };

  const handleViewDetails = (user: ClerkUser) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const handleSetRole = (userId: string, role: string) => {
    const formData = new FormData();
    formData.append("id", userId);
    formData.append("role", role);

    startTransition(async () => {
      await setRole(formData);
      router.refresh();
    });
  };

  const handleRemoveRole = (userId: string) => {
    const formData = new FormData();
    formData.append("id", userId);

    startTransition(async () => {
      await removeRole(formData);
      router.refresh();
    });
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Create At</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((user) => (
                <TableRow
                  key={user.id}
                  className={isPending ? "opacity-60" : ""}
                >
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.imageUrl || "/placeholder.svg"}
                          alt={user.fullName}
                        />
                        <AvatarFallback>
                          {user.firstName?.[0] || ""}
                          {user.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div style={{ marginLeft: 10 }}>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role || "User"} />
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
                        <DropdownMenuLabel>Action</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(user)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Permissions</DropdownMenuLabel>
                        <DropdownMenuItem
                          disabled={isPending}
                          onClick={() => handleSetRole(user.id, "admin")}
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={isPending}
                          onClick={() => handleSetRole(user.id, "designer")}
                        >
                          <Palette className="mr-2 h-4 w-4" />
                          Make Designer
                        </DropdownMenuItem>
                        {user.role && user.role.toLowerCase() !== "user" && (
                          <DropdownMenuItem
                            disabled={isPending}
                            onClick={() => handleRemoveRole(user.id)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Revoke Role
                          </DropdownMenuItem>
                        )}
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
                    <h3 className="font-medium">User not found</h3>
                    <p className="text-sm text-muted-foreground">
                      No users were found matching the search criteria.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {staff.length > itemsPerPage && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
            </PaginationItem>

            {getPaginationNumbers().map((page, index) => {
              if (page === "ellipsis-start" || page === "ellipsis-end") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={index}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => handlePageChange(page as number)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* User Details Dialog */}
      <UserDetailsDialog
        staff={selectedUser}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
}
