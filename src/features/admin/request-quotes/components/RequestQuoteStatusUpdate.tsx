"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Clock,
    DollarSign,
    CheckCircle,
    XCircle,
    Eye,
    FileCheck,
    Calendar,
    Package,
    Palette,
    MessageSquare,
} from "lucide-react";
import { formatPrice } from "@/lib/price";
import { useCreateAdminResponse, useUpdateRequestQuoteStatusMutation } from "../services/mutations";
import { toast } from "sonner";
import RequestQuoteResponseForm from "./RequestQuoteResponseForm";

interface RequestQuote {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    type: "product" | "custom";
    status: "pending" | "reviewing" | "quoted" | "approved" | "rejected" | "completed";
    quotedPrice?: number;
    rejectionReason?: string;
    adminNotes?: string;
    responseMessage?: string;
    currentVersion?: number;
    totalRevisions?: number;
    hasUnviewedResponse?: boolean;
    priceBreakdown?: {
        basePrice?: number;
        setupFee?: number;
        designFee?: number;
        rushFee?: number;
        shippingCost?: number;
        tax?: number;
        totalPrice?: number;
    };
    productionDetails?: {
        estimatedDays?: number;
        printingMethod?: "DTG" | "DTF" | "Screen Print" | "Vinyl" | "Embroidery";
        materialSpecs?: string;
        colorLimitations?: string;
        sizeAvailability?: { size: string; available: boolean }[];
    };
    validUntil?: string;
    createdAt: string;
    updatedAt: string;
}

interface RequestQuoteStatusUpdateProps {
    quote: RequestQuote;
}

const getStatusConfig = (status: string) => {
    switch (status) {
        case "pending":
            return {
                label: "Pending",
                description: "Waiting for admin review",
                color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                icon: Clock,
            };
        case "reviewing":
            return {
                label: "Reviewing",
                description: "Currently under review",
                color: "bg-blue-100 text-blue-800 border-blue-200",
                icon: Eye,
            };
        case "quoted":
            return {
                label: "Quoted",
                description: "Price quote provided",
                color: "bg-purple-100 text-purple-800 border-purple-200",
                icon: DollarSign,
            };
        case "revised":
            return {
                label: "Revised",
                description: "Quote has been revised",
                color: "bg-orange-100 text-orange-800 border-orange-200",
                icon: FileCheck,
            };
        case "approved":
            return {
                label: "Approved",
                description: "Quote has been approved",
                color: "bg-green-100 text-green-800 border-green-200",
                icon: CheckCircle,
            };
        case "rejected":
            return {
                label: "Rejected",
                description: "Quote has been rejected",
                color: "bg-red-100 text-red-800 border-red-200",
                icon: XCircle,
            };
        case "completed":
            return {
                label: "Completed",
                description: "Order completed",
                color: "bg-gray-100 text-gray-800 border-gray-200",
                icon: FileCheck,
            };
        default:
            return {
                label: status,
                description: "",
                color: "bg-gray-100 text-gray-800 border-gray-200",
                icon: Clock,
            };
    }
};

export function RequestQuoteStatusUpdate({ quote }: RequestQuoteStatusUpdateProps) {
    const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
    const [selectedInitialStatus, setSelectedInitialStatus] = useState<string>("");
    const router = useRouter();

    const createResponseMutation = useCreateAdminResponse();
    const updateStatusMutation = useUpdateRequestQuoteStatusMutation();

    const currentStatusConfig = getStatusConfig(quote.status);
    const StatusIcon = currentStatusConfig.icon;

    // ✅ UPDATED: Enhanced next steps logic
    const getNextSteps = (status: string) => {
        switch (status) {
            case "pending":
                return ["reviewing", "rejected"];
            case "reviewing":
                return ["quoted", "rejected"];
            case "quoted":
                return ["revised", "approved", "rejected"];
            case "revised":
                return ["approved", "rejected"];
            case "approved":
                return ["completed"];
            case "rejected":
                return ["reviewing"];
            case "completed":
                return [];
            default:
                return ["reviewing"];
        }
    };

    const nextSteps = getNextSteps(quote.status);

    const handleQuickAction = async (status: string) => {
        setSelectedInitialStatus(status);
        if (status === "reviewing") {
            await updateStatusMutation.mutateAsync({
                id: quote.id,
                status,
            });
            toast.success(`Status updated to ${status}`);
            return
        }
        setIsResponseDialogOpen(true);
    };

    const handleResponseSubmit = async (data: any) => {
        try {
            const submitData = {
                status: data.status,
                quotedPrice: data.quotedPrice ? parseFloat(data.quotedPrice) : undefined,
                responseMessage: data.responseMessage,
                rejectionReason: data.rejectionReason,
                adminNotes: data.adminNotes,
                priceBreakdown: (data.status === "quoted" || data.status === "revised") ? {
                    basePrice: parseFloat(data.basePrice || "0") || undefined,
                    setupFee: parseFloat(data.setupFee || "0") || 0,
                    designFee: parseFloat(data.designFee || "0") || 0,
                    rushFee: parseFloat(data.rushFee || "0") || 0,
                    shippingCost: parseFloat(data.shippingCost || "0") || 0,
                    tax: parseFloat(data.tax || "0") || 0,
                    totalPrice: parseFloat(data.quotedPrice || "0"),
                } : undefined,
                productionDetails: (data.status === "quoted" || data.status === "revised") ? {
                    estimatedDays: data.estimatedDays ? parseInt(data.estimatedDays) : undefined,
                    printingMethod: data.printingMethod,
                    materialSpecs: data.materialSpecs,
                    colorLimitations: data.colorLimitations,
                } : undefined,
                validUntil: data.validUntil,
            };

            await createResponseMutation.mutateAsync({
                quoteId: quote.id,
                responseData: submitData,
            });

            setIsResponseDialogOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Error creating response:", error);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <StatusIcon className="h-5 w-5" />
                                Status Management
                            </CardTitle>
                            <CardDescription>
                                Update the status and manage this quote request
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={currentStatusConfig.color}>
                                {currentStatusConfig.label}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Current Status Information */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">Current Status</h4>
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <StatusIcon className="h-5 w-5" />
                                <div>
                                    <p className="font-medium">{currentStatusConfig.label}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {currentStatusConfig.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Current Response Message */}
                        {quote.responseMessage && (
                            <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Response Message
                                </h4>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800 whitespace-pre-wrap">
                                        {quote.responseMessage}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Price breakdown display */}
                        {quote.quotedPrice && (
                            <div>
                                <h4 className="font-medium mb-2">Current Quote Price</h4>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatPrice(quote.quotedPrice)}
                                </p>

                                {/* Show price breakdown if available */}
                                {quote.priceBreakdown && (
                                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="space-y-1 text-sm">
                                            {quote.priceBreakdown.basePrice && (
                                                <div className="flex justify-between">
                                                    <span>Base Price:</span>
                                                    <span>{formatPrice(quote.priceBreakdown.basePrice)}</span>
                                                </div>
                                            )}
                                            {(quote.priceBreakdown.setupFee ?? 0) > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Setup Fee:</span>
                                                    <span>{formatPrice(quote.priceBreakdown.setupFee!)}</span>
                                                </div>
                                            )}
                                            {(quote.priceBreakdown.designFee ?? 0) > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Design Fee:</span>
                                                    <span>{formatPrice(quote.priceBreakdown.designFee!)}</span>
                                                </div>
                                            )}
                                            {(quote.priceBreakdown.rushFee ?? 0) > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Rush Fee:</span>
                                                    <span>{formatPrice(quote.priceBreakdown.rushFee!)}</span>
                                                </div>
                                            )}
                                            {(quote.priceBreakdown.shippingCost ?? 0) > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Shipping:</span>
                                                    <span>{formatPrice(quote.priceBreakdown.shippingCost!)}</span>
                                                </div>
                                            )}
                                            {(quote.priceBreakdown.tax ?? 0) > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Tax:</span>
                                                    <span>{formatPrice(quote.priceBreakdown.tax!)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/*Production Details Display */}
                        {quote.productionDetails && (
                            <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Production Details
                                </h4>
                                <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                                    {quote.productionDetails.estimatedDays && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Production Time: {quote.productionDetails.estimatedDays} days</span>
                                        </div>
                                    )}
                                    {quote.productionDetails.printingMethod && (
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            <span>Method: {quote.productionDetails.printingMethod}</span>
                                        </div>
                                    )}
                                    {quote.productionDetails.materialSpecs && (
                                        <div>
                                            <strong>Materials:</strong> {quote.productionDetails.materialSpecs}
                                        </div>
                                    )}
                                    {quote.productionDetails.colorLimitations && (
                                        <div className="flex items-center gap-2">
                                            <Palette className="h-4 w-4" />
                                            <span>Color Limits: {quote.productionDetails.colorLimitations}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/*Valid Until Display */}
                        {quote.validUntil && (
                            <div>
                                <h4 className="font-medium mb-2">Quote Valid Until</h4>
                                <div className="flex items-center gap-2 text-sm text-orange-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(quote.validUntil).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}

                        {/* Current Admin Notes */}
                        {quote.adminNotes && (
                            <div>
                                <h4 className="font-medium mb-2">Admin Notes</h4>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm whitespace-pre-wrap">{quote.adminNotes}</p>
                                </div>
                            </div>
                        )}

                        {/* Current Rejection Reason */}
                        {quote.rejectionReason && (
                            <div>
                                <h4 className="font-medium mb-2 text-red-600">Rejection Reason</h4>
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800 whitespace-pre-wrap">
                                        {quote.rejectionReason}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Quick Actions */}
                    {nextSteps.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-3">Quick Actions</h4>
                            <div className="flex flex-wrap gap-2">
                                {nextSteps.map((status) => {
                                    const config = getStatusConfig(status);
                                    const Icon = config.icon;
                                    return (
                                        <Button
                                            key={status}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleQuickAction(status)}
                                            className="flex items-center gap-2"
                                        >
                                            <Icon className="h-4 w-4" />
                                            {config.label}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Main Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            className="flex-1"
                            onClick={() => {
                                setSelectedInitialStatus("");
                                setIsResponseDialogOpen(true);
                            }}
                        >
                            Create Response
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Response Form Dialog */}
            <RequestQuoteResponseForm
                open={isResponseDialogOpen}
                onOpenChange={setIsResponseDialogOpen}
                quote={quote}
                initialStatus={selectedInitialStatus}
                onSubmit={handleResponseSubmit}
                isLoading={createResponseMutation.isPending}
                mode="respond"
            />
        </>
    );
}