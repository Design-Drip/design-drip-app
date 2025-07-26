"use client";

import {
  Calendar,
  Clock,
  DollarSign,
  FileCheck,
  MessageSquare,
  Package,
  Palette,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatOrderDateTime, formatOrderDate } from "@/lib/date";
import { formatPrice } from "@/lib/price";

// Types
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

interface AdminResponseTimelineProps {
  adminResponses: AdminResponse[];
  hasUnviewedResponse?: boolean;
  onAcceptQuote?: (responseId: string) => void;
  onRequestChanges?: (responseId: string) => void;
  onAskQuestions?: (responseId: string) => void;
}

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

export function AdminResponseTimeline({
  adminResponses,
  hasUnviewedResponse,
  onAcceptQuote,
  onRequestChanges,
  onAskQuestions,
}: AdminResponseTimelineProps) {
  if (!adminResponses.length) {
    return null;
  }

  return (
    <>
      <Separator />
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Admin Response
          {hasUnviewedResponse && (
            <Badge variant="default" className="ml-2 bg-blue-600">
              New
            </Badge>
          )}
        </h3>

        <div className="space-y-4">
          {adminResponses
            .filter(response => response.isCurrentVersion)
            .map((response, index) => (
              <div key={index} className="relative">
                {/* Response Card */}
                <Card className={`${
                  !response.customerViewed ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-600 text-white text-xs">
                            AD
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">Admin Response</p>
                          <p className="text-xs text-muted-foreground">
                            {formatOrderDateTime(response.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        <StatusBadge status={response.status} />

                        {/* Version Badge */}
                        {response.version > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            v{response.version}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Response Message */}
                    {response.responseMessage && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 mt-0.5 text-blue-600" />
                          <span className="font-medium text-sm">Message</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {response.responseMessage}
                        </p>
                      </div>
                    )}

                    {/* Price Information */}
                    {response.quotedPrice && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-800">
                              Quoted Price
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-700">
                              {formatPrice(response.quotedPrice)}
                            </p>
                            {response.validUntil && (
                              <p className="text-xs text-green-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Valid until {formatOrderDate(response.validUntil)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Price Breakdown */}
                        {response.priceBreakdown && (
                          <details className="mt-3">
                            <summary className="text-sm text-green-700 cursor-pointer hover:text-green-800 font-medium">
                              View price breakdown
                            </summary>
                            <div className="mt-3 space-y-2 text-sm">
                              {response.priceBreakdown.basePrice && (
                                <div className="flex justify-between py-1">
                                  <span>Base price</span>
                                  <span>{formatPrice(response.priceBreakdown.basePrice)}</span>
                                </div>
                              )}
                              {(response.priceBreakdown.setupFee ?? 0) > 0 && (
                                <div className="flex justify-between py-1">
                                  <span>Setup fee</span>
                                  <span>{formatPrice(response.priceBreakdown.setupFee!)}</span>
                                </div>
                              )}
                              {(response.priceBreakdown.designFee ?? 0) > 0 && (
                                <div className="flex justify-between py-1">
                                  <span>Design fee</span>
                                  <span>{formatPrice(response.priceBreakdown.designFee!)}</span>
                                </div>
                              )}
                              {(response.priceBreakdown.rushFee ?? 0) > 0 && (
                                <div className="flex justify-between py-1 text-orange-600">
                                  <span>Rush fee</span>
                                  <span>{formatPrice(response.priceBreakdown.rushFee!)}</span>
                                </div>
                              )}
                              {(response.priceBreakdown.shippingCost ?? 0) > 0 && (
                                <div className="flex justify-between py-1">
                                  <span>Shipping</span>
                                  <span>{formatPrice(response.priceBreakdown.shippingCost!)}</span>
                                </div>
                              )}
                              {(response.priceBreakdown.tax ?? 0) > 0 && (
                                <div className="flex justify-between py-1">
                                  <span>Tax</span>
                                  <span>{formatPrice(response.priceBreakdown.tax!)}</span>
                                </div>
                              )}
                              <Separator className="my-2" />
                              <div className="flex justify-between py-1 font-semibold text-green-700">
                                <span>Total</span>
                                <span>{formatPrice(response.quotedPrice)}</span>
                              </div>
                            </div>
                          </details>
                        )}
                      </div>
                    )}

                    {/* Production Details */}
                    {response.productionDetails && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-800">
                            Production Information
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {response.productionDetails.estimatedDays && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="font-medium">Production time</p>
                                <p className="text-blue-700">
                                  {response.productionDetails.estimatedDays} business days
                                </p>
                              </div>
                            </div>
                          )}

                          {response.productionDetails.printingMethod && (
                            <div className="flex items-center gap-2">
                              <Palette className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="font-medium">Printing method</p>
                                <p className="text-blue-700">
                                  {response.productionDetails.printingMethod}
                                </p>
                              </div>
                            </div>
                          )}

                          {response.productionDetails.materialSpecs && (
                            <div className="md:col-span-2">
                              <p className="font-medium mb-1">Materials</p>
                              <p className="text-blue-700">
                                {response.productionDetails.materialSpecs}
                              </p>
                            </div>
                          )}

                          {response.productionDetails.colorLimitations && (
                            <div className="md:col-span-2">
                              <p className="font-medium mb-1">Color limitations</p>
                              <p className="text-blue-700">
                                {response.productionDetails.colorLimitations}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Revision Reason (for revisions) */}
                    {response.revisionReason && (
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <div className="flex items-start gap-2">
                          <FileCheck className="h-4 w-4 mt-0.5 text-orange-600" />
                          <div>
                            <span className="font-medium text-orange-800 text-sm">
                              Revision notes
                            </span>
                            <p className="text-sm text-orange-700 mt-1">
                              {response.revisionReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons for Quoted Status */}
                    {response.status === 'quoted' && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => onAcceptQuote?.(response.id)}
                        >
                          Accept Quote
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onRequestChanges?.(response.id)}
                        >
                          Request Changes
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onAskQuestions?.(response.id)}
                        >
                          Ask Questions
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default AdminResponseTimeline;