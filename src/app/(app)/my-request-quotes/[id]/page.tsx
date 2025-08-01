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
  design_id?: string;

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

  // Type assertion to ensure design_id is available
  const quoteData = quote?.data as QuoteData | undefined;
  console.log("quoteData:", quoteData);

  // Fetch design if quote has design_id
  const {
    data: design,
    isLoading: designLoading,
  } = useQuery({
    queryKey: ["design", quoteData?.design_id],
    queryFn: async () => {
      if (!quoteData?.design_id) return null;
      const res = await fetch(`/api/design/${quoteData.design_id}`);
      if (!res.ok) throw new Error("Failed to fetch design");
      const data = await res.json();
      return data.data;
    },
    enabled: !!quoteData?.design_id,
  });

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



  if (!quoteData) {
    return (
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading quote details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

          {/* ✅ NEW: Design Images Display */}
          {quoteData.design_id && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Design Preview
                </h3>
                {designLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading design...</span>
                  </div>
                ) : design && design.design_images ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Design completed by designer</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(design.design_images).map(([view, imageUrl]) => (
                        <div key={view} className="flex flex-col items-center">
                          <div className="relative w-full aspect-square border rounded-lg overflow-hidden bg-white shadow-sm">
                            <img
                              src={imageUrl as string}
                              alt={`Design ${view}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 font-medium capitalize">
                            {view.replace('_', ' ')}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {design.name && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="text-sm text-green-700">
                          <span className="font-medium">Design Name:</span> {design.name}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
                      <span className="font-medium text-yellow-800">Design in progress</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-2">
                      The designer is working on your design. You'll be able to view it here once completed.
                    </p>
                  </div>
                )}
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

          {/* ✅ NEW: Simple Quote Display (when status is quoted) */}
          {quoteData.status === "quoted" && (
            <>
              <Separator />
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 mb-4">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-semibold text-lg">
                    Quote: {formatPrice(quoteData.quotedPrice!)}
                  </span>
                </div>

                {quoteData.responseMessage && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Message from Admin:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {quoteData.responseMessage}
                    </p>
                  </div>
                )}

                {/* Price Breakdown */}
                {quoteData.priceBreakdown && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-3 text-green-700">Price Breakdown:</h4>
                    <div className="bg-white/50 border border-green-200 rounded-lg p-3">
                      <div className="space-y-2 text-sm">
                        {quoteData.priceBreakdown.basePrice && (
                          <div className="flex justify-between py-1">
                            <span>Base price</span>
                            <span className="font-medium">{formatPrice(quoteData.priceBreakdown.basePrice)}</span>
                          </div>
                        )}
                        {quoteData.priceBreakdown.setupFee && quoteData.priceBreakdown.setupFee > 0 && (
                          <div className="flex justify-between py-1">
                            <span>Setup fee</span>
                            <span className="font-medium">{formatPrice(quoteData.priceBreakdown.setupFee)}</span>
                          </div>
                        )}
                        {quoteData.priceBreakdown.designFee && quoteData.priceBreakdown.designFee > 0 && (
                          <div className="flex justify-between py-1">
                            <span>Design fee</span>
                            <span className="font-medium">{formatPrice(quoteData.priceBreakdown.designFee)}</span>
                          </div>
                        )}
                        {quoteData.priceBreakdown.rushFee && quoteData.priceBreakdown.rushFee > 0 && (
                          <div className="flex justify-between py-1">
                            <span>Rush fee</span>
                            <span className="font-medium">{formatPrice(quoteData.priceBreakdown.rushFee)}</span>
                          </div>
                        )}
                        {quoteData.priceBreakdown.shippingCost && quoteData.priceBreakdown.shippingCost > 0 && (
                          <div className="flex justify-between py-1">
                            <span>Shipping cost</span>
                            <span className="font-medium">{formatPrice(quoteData.priceBreakdown.shippingCost)}</span>
                          </div>
                        )}
                        {quoteData.priceBreakdown.tax && quoteData.priceBreakdown.tax > 0 && (
                          <div className="flex justify-between py-1">
                            <span>Tax</span>
                            <span className="font-medium">{formatPrice(quoteData.priceBreakdown.tax)}</span>
                          </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between py-2 font-semibold text-green-700 text-base">
                          <span>Total</span>
                          <span>{formatPrice(quoteData.quotedPrice!)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Production Details */}
                {quoteData.productionDetails && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Production Details:</h4>
                    <div className="text-sm space-y-1">
                      {quoteData.productionDetails.estimatedDays && (
                        <p>• Production time: {quoteData.productionDetails.estimatedDays} days</p>
                      )}
                      {quoteData.productionDetails.printingMethod && (
                        <p>• Method: {quoteData.productionDetails.printingMethod}</p>
                      )}
                    </div>
                  </div>
                )}

                {quoteData.validUntil && (
                  <p className="text-sm text-gray-600 mb-4">
                    Valid until: {formatOrderDate(quoteData.validUntil)}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAcceptQuote}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Accept Quote
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRejectQuote}
                  >
                    Reject Quote
                  </Button>
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