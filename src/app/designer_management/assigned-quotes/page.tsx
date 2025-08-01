"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Package, FileText, Clock, DollarSign } from "lucide-react";
import { formatOrderDate } from "@/lib/date";
import { formatPrice } from "@/lib/price";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

interface AssignedQuote {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  company?: string;
  status: string;
  quotedPrice?: number;
  productDetails?: any;
  customRequest?: any;
  needDeliveryBy?: string;
  design_id?: string;
  designStatus?: string;
  createdAt: string;
  updatedAt: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case "reviewing":
        return {
          label: "Reviewing",
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "quoted":
        return {
          label: "Quoted",
          className: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "approved":
        return {
          label: "Approved",
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "rejected":
        return {
          label: "Rejected",
          className: "bg-red-100 text-red-800 border-red-200",
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const config = getStatusConfig(status);
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

const DesignStatusBadge = ({ design_id, designStatus }: { design_id?: string; designStatus?: string }) => {
  if (design_id) {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
        Completed
      </Badge>
    );
  }
  
  if (designStatus === "in_progress") {
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
        In Progress
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
      Not Started
    </Badge>
  );
};

export default function AssignedQuotesPage() {
  const [quotes, setQuotes] = useState<AssignedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    // Chỉ gọi API khi user đã load xong
    if (user?.id) {
      fetchAssignedQuotes();
    }
  }, [user?.id]); // Dependency array theo user?.id

  const fetchAssignedQuotes = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        throw new Error("User not found");
      }
      
      // Sử dụng endpoint GET / đã được sửa để designer có thể xem quote được assign
      const response = await fetch("/api/request-quotes");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch assigned quotes");
      }
      
      // Lọc chỉ lấy quote được assign cho designer (designerId = user.id)
      const allQuotes = data.items || [];
      
      const assignedQuotes = allQuotes.filter((quote: any) => {
        return quote.designerId === user.id;
      });
      
      setQuotes(assignedQuotes);
    } catch (err: any) {
      console.error("Error in fetchAssignedQuotes:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading assigned quotes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="font-medium">Error loading assigned quotes</p>
              <p className="text-sm mt-1">{error}</p>
              <Button 
                onClick={fetchAssignedQuotes} 
                variant="outline" 
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container  space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assigned Quotes</h1>
          <p className="text-muted-foreground">
            Manage request quotes assigned to you by admin
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Designs Completed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotes.filter(q => q.design_id).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Request Quotes ({quotes.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {quotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No assigned quotes</h3>
              <p className="text-muted-foreground">
                You don't have any request quotes assigned yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Design Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quote Price</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {quote.firstName} {quote.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {quote.emailAddress}
                          </div>
                          {quote.company && (
                            <div className="text-xs text-muted-foreground">
                              {quote.company}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DesignStatusBadge design_id={quote.design_id} designStatus={quote.designStatus} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={quote.status} />
                      </TableCell>
                      <TableCell>
                        {quote.quotedPrice ? (
                          <div className="font-medium">
                            {formatPrice(quote.quotedPrice)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not quoted</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatOrderDate(quote.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/designer_management/assigned-quotes/${quote.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 