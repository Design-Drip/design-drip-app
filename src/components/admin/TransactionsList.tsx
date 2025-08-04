"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, Filter, RefreshCw, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTransactionsQuery } from "@/features/payments/services/queries";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TransactionsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const {
    data: transactionData,
    isLoading: loading,
    error,
    refetch,
    isFetching,
  } = useQuery(
    getTransactionsQuery({
      page,
      limit,
      status: statusFilter !== "all" ? statusFilter : undefined,
      email: searchTerm.includes("@") ? searchTerm : undefined,
    })
  );

  const transactions = transactionData?.transactions || [];
  const pagination = transactionData?.pagination;

  // Client-side filtering for search terms that aren't email
  const filteredTransactions = transactions.filter((transaction) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const matchesId = transaction.id.toLowerCase().includes(searchLower);
    const matchesCustomerName = transaction.customer?.name
      ?.toLowerCase()
      .includes(searchLower);
    const matchesCustomerEmail = transaction.customer?.email
      ?.toLowerCase()
      .includes(searchLower);

    return matchesId || matchesCustomerName || matchesCustomerEmail;
  });

  const getStatusBadgeVariant = (
    status: string,
    refunded: boolean,
    disputed: boolean
  ) => {
    if (refunded) return "outline";
    if (disputed) return "destructive";

    switch (status) {
      case "succeeded":
        return "success" as any;
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusText = (
    status: string,
    refunded: boolean,
    disputed: boolean
  ) => {
    if (refunded) return "refunded";
    if (disputed) return "disputed";
    return status;
  };

  const getTypeBadgeVariant = (paymentMethod: string) => {
    switch (paymentMethod) {
      case "card":
        return "default";
      case "bank_transfer":
        return "secondary";
      case "wallet":
        return "outline";
      default:
        return "secondary";
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          All Transactions
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              disabled={isFetching}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={handleStatusFilter}
            disabled={isFetching}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="succeeded">Succeeded</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="disputed">Disputed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                {(error as Error).message || "Failed to load transactions"}
              </span>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Loading transactions...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="h-10 w-10 text-muted-foreground opacity-20" />
                      <h3 className="font-medium mt-2">
                        No transactions found
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        No transactions match your search criteria. Try
                        adjusting your filters or check back later.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className={isFetching ? "opacity-60" : ""}
                  >
                    <TableCell className="font-mono text-sm">
                      {transaction.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {transaction.customer?.name || "Unknown Customer"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.customer?.email || "No email"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getTypeBadgeVariant(transaction.paymentMethod)}
                      >
                        {transaction.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(
                          transaction.status,
                          transaction.refunded,
                          transaction.disputed
                        )}
                        className={
                          transaction.status === "succeeded" &&
                          !transaction.refunded &&
                          !transaction.disputed
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : ""
                        }
                      >
                        {getStatusText(
                          transaction.status,
                          transaction.refunded,
                          transaction.disputed
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(transaction.created)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/transactions/${transaction.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrevPage || isFetching}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNextPage || isFetching}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
