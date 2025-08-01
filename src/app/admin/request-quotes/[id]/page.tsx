"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  FileText,
  Edit,
  Loader2,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatOrderDateTime, formatOrderDate } from "@/lib/date";
import { formatPrice } from "@/lib/price";
import { RequestQuoteStatusUpdate } from "@/features/admin/request-quotes/components/RequestQuoteStatusUpdate";
import { useQuery } from "@tanstack/react-query";
import { getRequestQuoteQuery } from "@/features/request-quote/services/queries";

export default function AdminRequestQuoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const quoteId = params.id;

  const {
    data,
    isLoading,
    isError,
  } = useQuery(getRequestQuoteQuery(quoteId));

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p>Loading quote details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="container py-10">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex gap-3 items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-600">
                There was an error loading this quote request. Please try again later.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/admin/request-quotes" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Request Quotes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quote = data.data;

  if (!quote) {
    return (
      <div className="container py-10">
        <Card className="text-center py-10">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Quote request not found
            </h2>
            <p className="text-muted-foreground mb-6">
              The quote request you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/admin/request-quotes" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Request Quotes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Status badge component
  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: "Pending", icon: Clock, className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      reviewing: { label: "Reviewing", icon: Eye, className: "bg-blue-100 text-blue-800 border-blue-200" },
      quoted: { label: "Quoted", icon: DollarSign, className: "bg-purple-100 text-purple-800 border-purple-200" },
      approved: { label: "Approved", icon: CheckCircle, className: "bg-green-100 text-green-800 border-green-200" },
      rejected: { label: "Rejected", icon: XCircle, className: "bg-red-100 text-red-800 border-red-200" },
      completed: { label: "Completed", icon: CheckCircle, className: "bg-gray-100 text-gray-800 border-gray-200" },
    }[status] || { label: status, icon: Clock, className: "bg-gray-100 text-gray-800 border-gray-200" };

    const Icon = config.icon;
    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container py-6">
      <Card className="w-full">
        <CardHeader className="">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="pl-0">
              <Link href="/admin/request-quotes" className="flex items-center text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <p className="text-sm">
                Request #{quote.id.slice(-8).toUpperCase()}
              </p>
              <div className="h-8 w-px bg-border"></div>
              <p className="text-sm text-muted-foreground">
                Product Quote
              </p>
              <div className="h-8 w-px bg-border"></div>
              {getStatusBadge(quote.status)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
              <div className="space-y-2">
                <div>
                  <strong>Name:</strong>
                  <p>{quote.firstName} {quote.lastName}</p>
                </div>
                <div>
                  <strong>Email:</strong>
                  <p>{quote.emailAddress}</p>
                </div>
                <div>
                  <strong>Phone:</strong>
                  <p>{quote.phone}</p>
                </div>
                {quote.company && (
                  <div>
                    <strong>Company:</strong>
                    <p>{quote.company}</p>
                  </div>
                )}
              </div>
              <div>
                <strong>Delivery Address:</strong>
                <div className="space-y-1 text-sm mt-1">
                  <p>{quote.streetAddress}</p>
                  <p>{quote.suburbCity}</p>
                  <p>{quote.state} {quote.postcode}</p>
                  <p>{quote.country}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quote Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quote Details
            </h3>

            {quote.productDetails && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4" />
                  <h4 className="font-semibold">Product Request</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {quote.productDetails.productId && (
                     <div>
                       <strong>Product:</strong>
                       <p>{typeof quote.productDetails.productId === 'string' ? quote.productDetails.productId : (quote.productDetails.productId as any).name}</p>
                     </div>
                   )}
                  <div>
                    <strong>Total Quantity:</strong>
                    <p>{quote.productDetails.quantity}</p>
                  </div>
                                     {quote.productDetails.selectedColorId && (
                     <div>
                       <strong>Color:</strong>
                       <p>{typeof quote.productDetails.selectedColorId === 'string' ? quote.productDetails.selectedColorId : (quote.productDetails.selectedColorId as any).color}</p>
                     </div>
                   )}
                  {quote.productDetails.quantityBySize && quote.productDetails.quantityBySize.length > 0 && (
                    <div className="md:col-span-2">
                      <strong>Size Breakdown:</strong>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {quote.productDetails.quantityBySize.map((item: any, index: number) => (
                          <div key={index} className="text-sm bg-white/50 p-2 rounded border">
                            <div className="font-medium">Size {item.size}</div>
                            <div className="text-muted-foreground">{item.quantity} pcs</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {quote.needDeliveryBy && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <strong className="text-blue-800">Delivery Deadline:</strong>
                  <p className="text-blue-700 font-medium">{formatOrderDate(quote.needDeliveryBy)}</p>
                </div>
              )}

              {quote.extraInformation && (
                <div className="bg-amber-50 p-3 rounded-lg md:col-span-2">
                  <strong className="text-amber-800">Additional Information:</strong>
                  <p className="text-amber-700 mt-1 whitespace-pre-wrap">{quote.extraInformation}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Status & Admin Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Status & Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Timeline */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <strong>Submitted:</strong>
                    <span>{quote.createdAt ? formatOrderDateTime(quote.createdAt) : 'N/A'}</span>
                  </div>
                  {quote.quotedAt && (
                    <div className="flex justify-between">
                      <strong>Quoted:</strong>
                      <span>{formatOrderDateTime(quote.quotedAt)}</span>
                    </div>
                  )}
                  {quote.approvedAt && (
                    <div className="flex justify-between">
                      <strong>Approved:</strong>
                      <span>{formatOrderDateTime(quote.approvedAt)}</span>
                    </div>
                  )}
                  {quote.rejectedAt && (
                    <div className="flex justify-between">
                      <strong>Rejected:</strong>
                      <span>{formatOrderDateTime(quote.rejectedAt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <strong>Last Updated:</strong>
                    <span>{quote.updatedAt ? formatOrderDateTime(quote.updatedAt) : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Admin Notes & Actions */}
              <div className="space-y-3">
                {quote.rejectionReason && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <strong className="text-red-800">Rejection Reason:</strong>
                    <p className="text-sm text-red-700 mt-1">{quote.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Status Update Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Admin Actions</h3>
            <RequestQuoteStatusUpdate quote={{ 
              ...quote, 
              type: "product",
              createdAt: quote.createdAt || new Date().toISOString(),
              updatedAt: quote.updatedAt || new Date().toISOString()
            }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}