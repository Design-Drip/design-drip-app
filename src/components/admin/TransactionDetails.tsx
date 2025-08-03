"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import {
  ArrowLeft,
  CreditCard,
  User,
  Package,
  DollarSign,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTransactionDetailQuery } from "@/features/payments/services/queries";

interface TransactionDetailsProps {
  transactionId: string;
}

export default function TransactionDetails({
  transactionId,
}: TransactionDetailsProps) {
  const {
    data: transaction,
    isLoading: loading,
    error,
    refetch,
  } = useQuery(getTransactionDetailQuery(transactionId));

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

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Loading transaction details...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !transaction) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">
              {(error as Error)?.message || "Transaction not found"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/transactions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transactions
          </Link>
        </Button>
        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Transaction Details
          </h1>
          <p className="text-muted-foreground">
            Transaction ID: {transaction.id}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Transaction Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Transaction Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Amount</span>
              <span className="text-2xl font-bold">
                {formatAmount(transaction.amount, transaction.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Payment Method</span>
              <Badge variant="default">{transaction.paymentMethod.type}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status</span>
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
            </div>
            {transaction.refunded && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Refunded Amount</span>
                <span className="text-sm font-semibold text-destructive">
                  {formatAmount(
                    transaction.refundedAmount,
                    transaction.currency
                  )}
                </span>
              </div>
            )}
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Created</span>
                <span>{formatDate(transaction.created)}</span>
              </div>
              {transaction.receiptUrl && (
                <div className="flex justify-between text-sm">
                  <span>Receipt</span>
                  <Button
                    variant="link"
                    size="sm"
                    asChild
                    className="h-auto p-0"
                  >
                    <a
                      href={transaction.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Receipt <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {transaction.customer ? (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-sm">
                    {transaction.customer.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-sm">
                    {transaction.customer.email || "N/A"}
                  </p>
                </div>
                {transaction.customer.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone
                    </label>
                    <p className="text-sm">{transaction.customer.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Customer ID
                  </label>
                  <p className="text-sm font-mono">{transaction.customer.id}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                No customer information available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Payment Method
              </label>
              <p className="text-sm capitalize">
                {transaction.paymentMethod.type}
              </p>
            </div>

            {transaction.paymentMethod.details?.card && (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Card
                  </label>
                  <p className="text-sm">
                    **** **** ****{" "}
                    {transaction.paymentMethod.details.card.last4}(
                    {transaction.paymentMethod.details.card.brand?.toUpperCase()}
                    )
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Expires
                  </label>
                  <p className="text-sm">
                    {transaction.paymentMethod.details.card.exp_month
                      ?.toString()
                      .padStart(2, "0")}
                    /{transaction.paymentMethod.details.card.exp_year}
                  </p>
                </div>
              </>
            )}

            {transaction.captured !== undefined && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Captured
                </label>
                <p className="text-sm">{transaction.captured ? "Yes" : "No"}</p>
              </div>
            )}

            {transaction.failureCode && (
              <div className="space-y-2">
                <Separator />
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Payment Failed</span>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Failure Code
                  </label>
                  <p className="text-sm">{transaction.failureCode}</p>
                </div>
                {transaction.failureMessage && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Failure Message
                    </label>
                    <p className="text-sm">{transaction.failureMessage}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Information */}
        {transaction.order && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Order ID
                </label>
                <p className="text-sm font-mono">{transaction.order.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Order Status
                </label>
                <p>
                  <OrderStatusBadge status={transaction.order.status} />
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Items
                </label>
                <p className="text-sm">
                  {transaction.order.items?.length || 0} item(s)
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/orders/${transaction.order.id}`}>
                  View Order Details
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Refunds */}
      {transaction.refunds && transaction.refunds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Refunds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transaction.refunds.map((refund) => (
                <div key={refund.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Refund ID
                      </label>
                      <p className="font-mono">{refund.id}</p>
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Amount
                      </label>
                      <p>{formatAmount(refund.amount, transaction.currency)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Reason
                      </label>
                      <p className="capitalize">{refund.reason || "N/A"}</p>
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Date
                      </label>
                      <p>{formatDate(refund.created)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dispute Information */}
      {transaction.dispute && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Dispute Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="font-medium text-muted-foreground">
                  Dispute ID
                </label>
                <p className="font-mono">{transaction.dispute.id}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">
                  Amount
                </label>
                <p>
                  {formatAmount(
                    transaction.dispute.amount,
                    transaction.currency
                  )}
                </p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">
                  Reason
                </label>
                <p className="capitalize">{transaction.dispute.reason}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">
                  Status
                </label>
                <Badge variant="destructive">
                  {transaction.dispute.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
