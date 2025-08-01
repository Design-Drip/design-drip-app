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
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calculator,
  Printer,
  Clock,
  Palette,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatOrderDateTime, formatOrderDate } from "@/lib/date";
import { formatPrice } from "@/lib/price";
import { getRequestQuoteQuery } from "@/features/request-quote/services/queries";
import { useUpdateRequestQuoteStatusMutation } from "@/features/admin/request-quotes/services/mutations";

// Types
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
  totalPrice?: number;
}

interface ProductionDetails {
  estimatedDays?: number;
  printingMethod?: string;
  materialSpecs?: string;
  colorLimitations?: string;
  sizeAvailability?: Array<{
    size: string;
    available: boolean;
  }>;
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
  productDetails?: ProductDetail;
  needDeliveryBy?: string;
  extraInformation?: string;
  needDesignService?: boolean;
  designDescription?: string;
  artwork?: string;
  desiredWidth?: number;
  desiredHeight?: number;
  status: "pending" | "reviewing" | "quoted" | "approved" | "rejected" | "completed";
  quotedPrice?: number;
  quotedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;
  responseMessage?: string;
  priceBreakdown?: PriceBreakdown;
  productionDetails?: ProductionDetails;
  validUntil?: string;

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
  const updateStatusMutation = useUpdateRequestQuoteStatusMutation();

  const {
    data: quote,
    isLoading,
    isError,
  } = useQuery(getRequestQuoteQuery(quoteId));

  // ✅ NEW: Handler functions for simple quote actions
  const handleAcceptQuote = async () => {
    try {
      if (quoteId) {
        await updateStatusMutation.mutateAsync({ id: quoteId, status: "approved" });
      }
    } catch (error) {
      console.error("Error accepting quote:", error);
    }
  };

  const handleRejectQuote = async () => {
    try {
      if (quoteId) {
        await updateStatusMutation.mutateAsync({ id: quoteId, status: "rejected" });
      }
    } catch (error) {
      console.error("Error rejecting quote:", error);
    }
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
                Product Quote
              </p>
              <div className="h-8 w-px bg-border"></div>
              <StatusBadge status={quoteData.status} />
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
          {quoteData.productDetails && (
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
          )}

          {/* ✅ NEW: Design Service Information */}
          {quoteData.needDesignService && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Design Service Request
                </h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Design service requested</span>
                  </div>
                  {quoteData.designDescription && (
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Design Requirements:</h4>
                      <p className="text-sm text-blue-700 whitespace-pre-wrap">
                        {quoteData.designDescription}
                      </p>
                    </div>
                  )}
                  {(quoteData.desiredWidth || quoteData.desiredHeight) && (
                    <div className="mt-3">
                      <h4 className="font-medium text-blue-800 mb-2">Desired Dimensions:</h4>
                      <p className="text-sm text-blue-700">
                        {quoteData.desiredWidth && `Width: ${quoteData.desiredWidth}"`}
                        {quoteData.desiredWidth && quoteData.desiredHeight && " × "}
                        {quoteData.desiredHeight && `Height: ${quoteData.desiredHeight}"`}
                      </p>
                    </div>
                  )}
                  {quoteData.artwork && (
                    <div className="mt-3">
                      <h4 className="font-medium text-blue-800 mb-2">Reference Artwork:</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(quoteData.artwork, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Reference
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
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

          {/* ✅ ENHANCED: Detailed Quote Display (when status is quoted) */}
          {quoteData.status === "quoted" && (
            <>
              <Separator />
              <div className="space-y-6">
                {/* Quote Header */}
                <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-800">
                          Official Quote: {formatPrice(quoteData.quotedPrice!)}
                        </h3>
                        <p className="text-sm text-green-600">
                          For {quoteData.productDetails?.quantity || 0} items
                        </p>
                      </div>
                    </div>
                    {quoteData.validUntil && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Valid until</p>
                        <p className="font-semibold text-orange-600">
                          {formatOrderDate(quoteData.validUntil)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Admin Response Message */}
                  {quoteData.responseMessage && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Message from Admin
                      </h4>
                      <div className="p-4 bg-white/70 border border-green-200 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {quoteData.responseMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Price Breakdown */}
                  {quoteData.priceBreakdown && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Detailed Price Breakdown
                      </h4>
                      <div className="bg-white/70 border border-green-200 rounded-lg overflow-hidden">
                        <div className="p-4 space-y-3">

                          {/* ✅ NEW: Product Summary Section */}
                          {quoteData.productDetails?.quantityBySize && quoteData.productDetails.quantityBySize.length > 0 && (
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h5 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Product Summary
                              </h5>
                              <div className="space-y-3">
                                <div className="text-sm">
                                  <span className="font-medium">Total Quantity:</span> {quoteData.productDetails.quantity} items
                                </div>
                                <div>
                                  <div className="font-medium text-sm mb-2">Size Breakdown & Pricing:</div>
                                  <div className="space-y-2">
                                    {quoteData.productDetails.quantityBySize.map((item: any, index: number) => {
                                      // Calculate pricing for each size (assuming base price + additional price structure)
                                      const basePrice = quoteData.priceBreakdown?.basePrice || 0;
                                      const totalForSize = basePrice * item.quantity;
                                      const additionalPrice = item.additional_price || 0;
                                      const pricePerUnit = (basePrice + additionalPrice);
                                      const originalPricePerUnit = pricePerUnit * 1.4; // Assuming 40% markup for retail
                                      const savings = (originalPricePerUnit - pricePerUnit) * item.quantity;
                                      const savingsPercentage = ((originalPricePerUnit - pricePerUnit) / originalPricePerUnit) * 100;

                                      return (
                                        <div key={index} className="p-3 bg-white border border-blue-200 rounded-md">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <div className="font-medium text-sm">
                                                Size {item.size}: {item.quantity} items
                                                {additionalPrice > 0 && (
                                                  <span className="text-orange-600 ml-2">
                                                    (+{formatPrice(additionalPrice)})
                                                  </span>
                                                )}
                                              </div>
                                              <div className="text-xs text-muted-foreground mt-1">
                                                Per unit: {formatPrice(pricePerUnit)}
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              <div className="line-through text-muted-foreground text-xs">
                                                {formatPrice(originalPricePerUnit * item.quantity)}
                                              </div>
                                              <div className="font-medium text-green-600">
                                                {formatPrice(totalForSize + (additionalPrice * item.quantity))}
                                              </div>
                                              {savings > 0 && (
                                                <div className="text-orange-600 font-medium text-xs">
                                                  Save {formatPrice(savings)} ({savingsPercentage.toFixed(1)}%)
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Customer Savings Summary */}
                                  {(() => {
                                    const totalOriginal = quoteData.productDetails.quantityBySize.reduce((sum: number, item: any) => {
                                      const basePrice = quoteData.priceBreakdown?.basePrice || 0;
                                      const additionalPrice = item.additional_price || 0;
                                      const pricePerUnit = basePrice + additionalPrice;
                                      const originalPricePerUnit = pricePerUnit * 1.4;
                                      return sum + (originalPricePerUnit * item.quantity);
                                    }, 0);

                                    const totalQuoted = quoteData.productDetails.quantityBySize.reduce((sum: number, item: any) => {
                                      const basePrice = quoteData.priceBreakdown?.basePrice || 0;
                                      const additionalPrice = item.additional_price || 0;
                                      return sum + ((basePrice + additionalPrice) * item.quantity);
                                    }, 0);

                                    const totalSavings = totalOriginal - totalQuoted;
                                    const savingsPercentage = (totalSavings / totalOriginal) * 100;

                                    return totalSavings > 0 && (
                                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="text-sm font-medium text-green-800 mb-1">
                                          Your Savings Summary:
                                        </div>
                                        <div className="text-xs text-green-700 space-y-1">
                                          <div>Retail Price: {formatPrice(totalOriginal)}</div>
                                          <div>Your Quote Price: {formatPrice(totalQuoted)}</div>
                                          <div className="font-bold text-green-800 text-sm">
                                            Total Savings: {formatPrice(totalSavings)} ({savingsPercentage.toFixed(1)}% off)
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Base Price Display */}
                          {quoteData.priceBreakdown.basePrice && (
                            <div className="flex justify-between items-center py-2 border-b border-green-100">
                              <div>
                                <span className="font-medium">Your Price Per Unit</span>
                                <p className="text-xs text-muted-foreground">
                                  Base price for {quoteData.productDetails?.quantity || 0} items
                                </p>
                                {quoteData.productDetails?.quantityBySize && (
                                  <div className="text-xs text-green-600 mt-1">
                                    28.6% off retail price
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-lg">
                                  {formatPrice(quoteData.priceBreakdown.basePrice / (quoteData.productDetails?.quantity || 1))}
                                </div>
                                <div className="text-xs text-green-600">
                                  Total: {formatPrice(quoteData.priceBreakdown.basePrice)}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Additional Fees */}
                          <div className="space-y-2">
                            {quoteData.priceBreakdown.setupFee && quoteData.priceBreakdown.setupFee > 0 && (
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="text-sm font-medium">Setup Fee</span>
                                  <p className="text-xs text-muted-foreground">One-time production setup</p>
                                </div>
                                <span className="font-medium text-orange-600">
                                  {formatPrice(quoteData.priceBreakdown.setupFee)}
                                </span>
                              </div>
                            )}

                            {quoteData.priceBreakdown.designFee && quoteData.priceBreakdown.designFee > 0 && (
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="text-sm font-medium">Design Fee</span>
                                  <p className="text-xs text-muted-foreground">
                                    {quoteData.needDesignService ? "Design service as requested" : "Additional design work"}
                                  </p>
                                </div>
                                <span className="font-medium text-blue-600">
                                  {formatPrice(quoteData.priceBreakdown.designFee)}
                                </span>
                              </div>
                            )}

                            {quoteData.priceBreakdown.rushFee && quoteData.priceBreakdown.rushFee > 0 && (
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="text-sm font-medium">Rush Fee</span>
                                  <p className="text-xs text-muted-foreground">
                                    {quoteData.needDeliveryBy ? "Rush delivery requested" : "Rush processing"}
                                  </p>
                                </div>
                                <span className="font-medium text-orange-500">
                                  {formatPrice(quoteData.priceBreakdown.rushFee)}
                                </span>
                              </div>
                            )}

                            {quoteData.priceBreakdown.shippingCost && quoteData.priceBreakdown.shippingCost > 0 && (
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="text-sm font-medium">Shipping Cost</span>
                                  <p className="text-xs text-muted-foreground">
                                    Delivery to {quoteData.suburbCity}, {quoteData.state}
                                  </p>
                                </div>
                                <span className="font-medium text-purple-600">
                                  {formatPrice(quoteData.priceBreakdown.shippingCost)}
                                </span>
                              </div>
                            )}

                            {quoteData.priceBreakdown.tax && quoteData.priceBreakdown.tax > 0 && (
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="text-sm font-medium">Tax</span>
                                  <p className="text-xs text-muted-foreground">VAT and applicable taxes</p>
                                </div>
                                <span className="font-medium text-gray-600">
                                  {formatPrice(quoteData.priceBreakdown.tax)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Calculated Total Display */}
                          <div className="border-t-2 border-green-300 pt-3 mt-3">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <span className="font-medium text-green-800">Calculated Total</span>
                                <p className="text-xs text-green-600">
                                  Based on pricing breakdown
                                </p>
                              </div>
                              <span className="text-lg font-bold text-green-700">
                                {(() => {
                                  const calculatedTotal =
                                    (quoteData.priceBreakdown.basePrice || 0) +
                                    (quoteData.priceBreakdown.setupFee || 0) +
                                    (quoteData.priceBreakdown.designFee || 0) +
                                    (quoteData.priceBreakdown.rushFee || 0) +
                                    (quoteData.priceBreakdown.shippingCost || 0) +
                                    (quoteData.priceBreakdown.tax || 0);
                                  return formatPrice(calculatedTotal);
                                })()}
                              </span>
                            </div>

                            {/* Final Quote Total */}
                            <div className="border-t pt-2">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="text-xl font-bold text-green-800">Total Quote</span>
                                  <p className="text-xs text-green-600">
                                    Average: {formatPrice(quoteData.quotedPrice! / (quoteData.productDetails?.quantity || 1))} per item
                                  </p>
                                </div>
                                <span className="text-2xl font-bold text-green-700">
                                  {formatPrice(quoteData.quotedPrice!)}
                                </span>
                              </div>
                            </div>

                            {/* Customer Value Display */}
                            {(() => {
                              const retailPrice = (quoteData.priceBreakdown.basePrice || 0) * 1.4; // Assuming retail markup
                              if (retailPrice > quoteData.quotedPrice!) {
                                return (
                                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                    <div className="text-sm text-green-700">
                                      <span className="font-medium">Customer Value:</span>
                                      <div className="text-xs mt-1">
                                        Retail Price: {formatPrice(retailPrice)} |
                                        You Save: {formatPrice(retailPrice - quoteData.quotedPrice!)}
                                        ({(((retailPrice - quoteData.quotedPrice!) / retailPrice) * 100).toFixed(1)}% off)
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Production Details */}
                  {quoteData.productionDetails && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Production Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quoteData.productionDetails.estimatedDays && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-800">Production Time</span>
                            </div>
                            <p className="text-xl font-bold text-blue-700">
                              {quoteData.productionDetails.estimatedDays} business days
                            </p>
                            {quoteData.needDeliveryBy && (
                              <p className="text-xs text-blue-600 mt-1">
                                Your requested date: {formatOrderDate(quoteData.needDeliveryBy)}
                              </p>
                            )}
                          </div>
                        )}

                        {quoteData.productionDetails.printingMethod && (
                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Printer className="h-4 w-4 text-purple-600" />
                              <span className="font-medium text-purple-800">Printing Method</span>
                            </div>
                            <p className="text-lg font-semibold text-purple-700">
                              {quoteData.productionDetails.printingMethod}
                            </p>
                          </div>
                        )}

                        {quoteData.productionDetails.materialSpecs && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg md:col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-amber-600" />
                              <span className="font-medium text-amber-800">Material Specifications</span>
                            </div>
                            <p className="text-sm text-amber-700">
                              {quoteData.productionDetails.materialSpecs}
                            </p>
                          </div>
                        )}

                        {quoteData.productionDetails.colorLimitations && (
                          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg md:col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Palette className="h-4 w-4 text-orange-600" />
                              <span className="font-medium text-orange-800">Color Information</span>
                            </div>
                            <p className="text-sm text-orange-700">
                              {quoteData.productionDetails.colorLimitations}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-green-200">
                    <Button
                      onClick={handleAcceptQuote}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                      disabled={updateStatusMutation.isPending}
                    >
                      {updateStatusMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Accept Quote
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRejectQuote}
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 font-semibold py-3"
                      disabled={updateStatusMutation.isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline Quote
                    </Button>
                  </div>

                  {/* Quote Validity Notice */}
                  {quoteData.validUntil && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          This quote expires on {formatOrderDate(quoteData.validUntil)}.
                          Please respond before this date to secure the quoted price.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Rejection reason display */}
          {quoteData.status === "rejected" && quoteData.rejectionReason && (
            <>
              <Separator />
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <XCircle className="h-5 w-5" />
                  <h4 className="font-medium">Rejection Reason:</h4>
                </div>
                <p className="text-sm text-red-700">{quoteData.rejectionReason}</p>
              </div>
            </>
          )}

          {/* Admin Notes */}
          {quoteData.adminNotes && (
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
        </CardContent>

        <CardFooter className="flex justify-between">
          {quoteData.status === "pending" && (
            <div className="text-sm text-muted-foreground">
              Waiting for admin review...
            </div>
          )}

          {quoteData.status === "reviewing" && (
            <div className="text-sm text-blue-600">
              Under review by admin...
            </div>
          )}

          {quoteData.status === "approved" && (
            <div className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Quote approved
            </div>
          )}

          {quoteData.status === "completed" && (
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Order completed
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}