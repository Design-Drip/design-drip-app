"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Loader2,
  AlertTriangle,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
  Building,
  FileText,
  Edit,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatOrderDateTime, formatOrderDate } from "@/lib/date";
import { formatPrice } from "@/lib/price";
import { getRequestQuoteQuery } from "@/features/request-quote/services/queries";
import AdminResponseTimeline from "@/features/my-request-quotes/components/AdminResponseTimeline";

// Types (move to separate types file if needed)
interface ProductDetail {
  productId?: {
    _id: string;
    name: string;
    default_price?: number;
  } | string;
  quantity: number;
  selectedColorId?: {
    _id: string;
    color: string;
    hex_code?: string;
  } | string;
  quantityBySize?: Array<{
    size: string;
    quantity: number;
  }>;
}

interface PriceBreakdown {
  basePrice?: number;
  setupFee?: number;
  designFee?: number;
  rushFee?: number;
  shippingCost?: number;
  tax?: number;
}

interface ProductionDetails {
  estimatedDays?: number;
  printingMethod?: string;
  materialSpecs?: string;
  colorLimitations?: string;
}

interface AdminResponse {
  id: string;
  status: "pending" | "reviewing" | "quoted" | "revised" | "approved" | "rejected" | "completed";
  responseMessage?: string;
  quotedPrice?: number;
  priceBreakdown?: PriceBreakdown;
  productionDetails?: ProductionDetails;
  validUntil?: string;
  revisionReason?: string;
  version: number;
  isCurrentVersion: boolean;
  customerViewed: boolean;
  createdAt: string;
}

interface QuoteData {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phone: string;
  company?: string;
  streetAddress: string;
  suburbCity: string;
  country: string;
  state: string;
  postcode: string;
  type: "product" | "custom";
  productDetails?: ProductDetail;
  customRequest?: {
    customNeed: string;
  };
  needDeliveryBy?: string;
  extraInformation?: string;
  status: "pending" | "reviewing" | "quoted" | "revised" | "approved" | "rejected" | "completed";
  quotedPrice?: number;
  quotedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;
  adminResponses?: AdminResponse[];
  hasUnviewedResponse?: boolean;
  currentVersion?: number;
  totalRevisions?: number;
  createdAt: string;
  updatedAt: string;
}

const getProductName = (productId: ProductDetail['productId']): string => {
  if (typeof productId === 'object' && productId?.name) {
    return productId.name;
  }
  return 'Unknown Product';
};

const getColorName = (selectedColorId: ProductDetail['selectedColorId']): string => {
  if (typeof selectedColorId === 'object' && selectedColorId?.color) {
    return selectedColorId.color;
  }
  return 'Unknown Color';
};

// Status badge component
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
      case "revised":
        return {
          label: "Revised",
          className: "bg-orange-100 text-orange-800 border-orange-200",
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
      case "completed":
        return {
          label: "Completed",
          className: "bg-gray-100 text-gray-800 border-gray-200",
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
    <Badge
      variant="outline"
      className={`text-sm font-medium ${config.className}`}
    >
      {config.label}
    </Badge>
  );
};

export default function RequestQuoteDetailPage() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const quoteId = params.id;

  const {
    data: quote,
    isLoading,
    isError,
  } = useQuery(getRequestQuoteQuery(quoteId));

  // Handler functions for admin response actions
  const handleAcceptQuote = (responseId: string) => {
    console.log("Accept quote:", responseId);
    // TODO: Implement accept quote functionality
  };

  const handleRequestChanges = (responseId: string) => {
    console.log("Request changes:", responseId);
    // TODO: Implement request changes functionality
  };

  const handleAskQuestions = (responseId: string) => {
    console.log("Ask questions:", responseId);
    // TODO: Implement ask questions functionality
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !quote?.data) {
    return (
      <div className="container mx-auto max-w-4xl py-10 px-4">
        <Button
          variant="ghost"
          onClick={() => router.replace("/my-request-quotes")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Quotes
        </Button>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="flex items-center justify-center py-10">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Quote Not Found
              </h3>
              <p className="text-red-600 mb-4">
                The requested quote could not be found or you don't have permission to view it.
              </p>
              <Button asChild>
                <Link href="/my-request-quotes">View All Quotes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quoteData = quote.data as QuoteData;

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold">
                Request #{quoteData.id.slice(-8).toUpperCase()}
              </p>
              <div className="h-8 w-px bg-border"></div>
              <p className="text-sm text-muted-foreground">
                {quoteData.type === "product" ? "Product Quote" : "Custom Quote"}
              </p>
              <div className="h-8 w-px bg-border"></div>
              <StatusBadge status={quoteData.status} />
              {/* Version Badge */}
              {quoteData.currentVersion && quoteData.currentVersion > 1 && (
                <Badge variant="secondary" className="text-xs">
                  v{quoteData.currentVersion}
                  {quoteData.totalRevisions && quoteData.totalRevisions > 0 &&
                    ` (${quoteData.totalRevisions} revisions)`
                  }
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quote Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Submitted:</span>
                <p className="font-medium">
                  {formatOrderDateTime(quoteData.createdAt)}
                </p>
              </div>
              {quoteData.needDeliveryBy && (
                <div>
                  <span className="text-muted-foreground">Needed by:</span>
                  <p className="font-medium">
                    {formatOrderDate(quoteData.needDeliveryBy)}
                  </p>
                </div>
              )}
              {quoteData.quotedPrice && (
                <div>
                  <span className="text-muted-foreground">Quoted Price:</span>
                  <p className="font-semibold text-green-600">
                    {formatPrice(quoteData.quotedPrice)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Product/Custom Details */}
          {quoteData.type === "product" && quoteData.productDetails ? (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {quoteData.productDetails.productId && (
                    <div>
                      <span className="text-muted-foreground text-sm">Product:</span>
                      <p className="font-medium">
                        {getProductName(quoteData.productDetails.productId)}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground text-sm">Total Quantity:</span>
                    <p className="font-medium">{quoteData.productDetails.quantity}</p>
                  </div>
                  {quoteData.productDetails.selectedColorId && (
                    <div>
                      <span className="text-muted-foreground text-sm">Color:</span>
                      <p className="font-medium">
                        {getColorName(quoteData.productDetails.selectedColorId)}
                      </p>
                    </div>
                  )}
                </div>

                {quoteData.productDetails.quantityBySize &&
                  quoteData.productDetails.quantityBySize.length > 0 && (
                    <div>
                      <span className="text-muted-foreground text-sm">Size Breakdown:</span>
                      <div className="mt-2 space-y-2">
                        {quoteData.productDetails.quantityBySize.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm">
                            <span>Size {item.size}</span>
                            <span className="font-medium">{item.quantity} pcs</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ) : (
            quoteData.customRequest && (
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Custom Requirements
                </h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm">
                    {quoteData.customRequest.customNeed}
                  </p>
                </div>
              </div>
            )
          )}

          <Separator />

          {/* Contact & Delivery Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{quoteData.firstName} {quoteData.lastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{quoteData.emailAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{quoteData.phone}</span>
                </div>
                {quoteData.company && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{quoteData.company}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </h3>
              <div className="text-sm space-y-1">
                <p>{quoteData.streetAddress}</p>
                <p>{quoteData.suburbCity}</p>
                <p>{quoteData.state} {quoteData.postcode}</p>
                <p>{quoteData.country}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {quoteData.extraInformation && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Additional Information</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm">
                    {quoteData.extraInformation}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Admin Response Timeline - Now using the separate component */}
          {quoteData.adminResponses && quoteData.adminResponses.length > 0 && (
            <AdminResponseTimeline
              adminResponses={quoteData.adminResponses}
              hasUnviewedResponse={quoteData.hasUnviewedResponse}
              onAcceptQuote={handleAcceptQuote}
              onRequestChanges={handleRequestChanges}
              onAskQuestions={handleAskQuestions}
            />
          )}

          {/* Legacy Quote Details (fallback for old data structure) */}
          {quoteData.quotedPrice && !quoteData.adminResponses?.length && (
            <>
              <Separator />
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-semibold text-lg">
                    Quoted Price: {formatPrice(quoteData.quotedPrice)}
                  </span>
                </div>
                {quoteData.quotedAt && (
                  <p className="text-sm text-green-600">
                    Quoted on {formatOrderDateTime(quoteData.quotedAt)}
                  </p>
                )}
                {quoteData.status === "quoted" && (
                  <div className="mt-3">
                    <Button className="mr-2">Accept Quote</Button>
                    <Button variant="outline">Contact Us</Button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Admin Notes (legacy) */}
          {quoteData.adminNotes && !quoteData.adminResponses?.length && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Admin Notes</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="whitespace-pre-wrap text-blue-800 text-sm">
                    {quoteData.adminNotes}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Rejection Reason */}
          {quoteData.status === "rejected" && quoteData.rejectionReason && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 text-red-600">Rejection Reason</h3>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="whitespace-pre-wrap text-red-800 text-sm">
                    {quoteData.rejectionReason}
                  </p>
                  {quoteData.rejectedAt && (
                    <p className="text-sm text-red-600 mt-2">
                      Rejected on {formatOrderDateTime(quoteData.rejectedAt)}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}