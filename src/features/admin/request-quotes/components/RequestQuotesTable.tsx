"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Eye,
    FileText,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    User,
    Palette,
    AlertCircle,
} from "lucide-react";
import { formatOrderDate, formatOrderDateTime } from "@/lib/date";
import { formatPrice } from "@/lib/price";
import { cn } from "@/lib/utils";
import { QuoteActions } from "./QuoteActions";

interface RequestQuote {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phone: string;
    company?: string;
    status: "pending" | "reviewing" | "quoted" | "approved" | "rejected" | "completed";
    quotedPrice?: number;
    productDetails?: any;
    customRequest?: any;
    needDeliveryBy?: string;

    // ✅ NEW: Design-related fields
    designId?: string;
    designStatus?: "pending" | "in_progress" | "awaiting_approval" | "approved" | "needs_revision" | "rejected" | "completed";
    needDesignService?: boolean;
    designerInfo?: {
        id: string;
        name: string;
        email: string;
    };
    designInfo?: {
        id: string;
        name: string;
        status: string;
    };

    createdAt: string;
    updatedAt: string;
    designerId?: string;
}

interface ClerkUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    imageUrl: string;
    isActive: boolean;
    role: string;
}

interface RequestQuotesTableProps {
    requestQuotes: RequestQuote[];
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case "pending":
                return {
                    label: "Pending",
                    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
                    icon: Clock,
                };
            case "reviewing":
                return {
                    label: "Reviewing",
                    className: "bg-blue-100 text-blue-800 border-blue-200",
                    icon: Eye,
                };
            case "quoted":
                return {
                    label: "Quoted",
                    className: "bg-purple-100 text-purple-800 border-purple-200",
                    icon: DollarSign,
                };
            case "approved":
                return {
                    label: "Approved",
                    className: "bg-green-100 text-green-800 border-green-200",
                    icon: CheckCircle,
                };
            case "rejected":
                return {
                    label: "Rejected",
                    className: "bg-red-100 text-red-800 border-red-200",
                    icon: XCircle,
                };
            case "completed":
                return {
                    label: "Completed",
                    className: "bg-gray-100 text-gray-800 border-gray-200",
                    icon: CheckCircle,
                };
            default:
                return {
                    label: status,
                    className: "bg-gray-100 text-gray-800 border-gray-200",
                    icon: FileText,
                };
        }
    };

    const config = getStatusConfig(status);
    const IconComponent = config.icon;

    return (
        <Badge variant="outline" className={cn("text-xs font-medium", config.className)}>
            <IconComponent className="w-3 h-3 mr-1" />
            {config.label}
        </Badge>
    );
};

// ✅ NEW: Design Status Badge component
const DesignStatusBadge = ({ status, needsDesign }: {
    status?: string;
    needsDesign?: boolean;
}) => {
    if (!needsDesign) {
        return (
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500 border-gray-200">
                No Design
            </Badge>
        );
    }

    if (!status) {
        return (
            <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                Not Set
            </Badge>
        );
    }

    const getDesignStatusConfig = (status: string) => {
        switch (status) {
            case "pending":
                return {
                    label: "Pending",
                    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
                    icon: Clock,
                };
            case "in_progress":
                return {
                    label: "In Progress",
                    className: "bg-blue-100 text-blue-700 border-blue-200",
                    icon: Palette,
                };
            case "awaiting_approval":
                return {
                    label: "Review",
                    className: "bg-orange-100 text-orange-700 border-orange-200",
                    icon: Eye,
                };
            case "approved":
                return {
                    label: "Approved",
                    className: "bg-green-100 text-green-700 border-green-200",
                    icon: CheckCircle,
                };
            case "needs_revision":
                return {
                    label: "Revision",
                    className: "bg-amber-100 text-amber-700 border-amber-200",
                    icon: AlertCircle,
                };
            case "rejected":
                return {
                    label: "Rejected",
                    className: "bg-red-100 text-red-800 border-red-200",
                    icon: XCircle,
                };
            case "completed":
                return {
                    label: "Complete",
                    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
                    icon: CheckCircle,
                };
            default:
                return {
                    label: status,
                    className: "bg-gray-100 text-gray-700 border-gray-200",
                    icon: FileText,
                };
        }
    };

    const config = getDesignStatusConfig(status);
    const IconComponent = config.icon;

    return (
        <Badge variant="outline" className={cn("text-xs font-medium", config.className)}>
            <IconComponent className="w-3 h-3 mr-1" />
            {config.label}
        </Badge>
    );
};

export function RequestQuotesTable({ requestQuotes }: RequestQuotesTableProps) {

    const getRequestSummary = (quote: RequestQuote) => {
        if (quote.productDetails) {
            const productName = quote.productDetails.productId?.name || "Product";
            return `${productName} (Qty: ${quote.productDetails.quantity})`;
        }
        return "No product details";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Request Quotes ({requestQuotes.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Request Details</TableHead>
                                <TableHead>Quote Status</TableHead>
                                <TableHead>Design Status</TableHead>
                                <TableHead>Designer</TableHead>
                                <TableHead>Quote Price</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requestQuotes.map((quote) => {
                                return (
                                    <TableRow key={quote.id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src="" />
                                                    <AvatarFallback>
                                                        {quote.firstName[0]}{quote.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="ml-4">
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
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="max-w-xs">
                                                <div className="font-medium text-sm">
                                                    {getRequestSummary(quote)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    ID: #{quote.id.slice(-8).toUpperCase()}
                                                </div>
                                                {quote.needDeliveryBy && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Needed: {formatOrderDate(quote.needDeliveryBy)}
                                                    </div>
                                                )}
                                                {quote.needDesignService && (
                                                    <div className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-1">
                                                        <Palette className="w-3 h-3" />
                                                        Design Service
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <StatusBadge status={quote.status} />
                                        </TableCell>

                                        <TableCell>
                                            <DesignStatusBadge
                                                status={quote.designStatus}
                                                needsDesign={quote.needDesignService}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            {quote.designerInfo ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-xs">
                                                            {quote.designerInfo.name.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="text-xs font-medium">
                                                            {quote.designerInfo.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {quote.designerInfo.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    Not Assigned
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {quote.quotedPrice ? (
                                                <div className="font-medium text-green-600">
                                                    {formatPrice(quote.quotedPrice)}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <div className="text-sm">
                                                {formatOrderDate(quote.createdAt)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatOrderDateTime(quote.createdAt).split(" ")[1]}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <QuoteActions quote={{ ...quote, designerId: quote.designerId }} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {/* Empty state */}
                            {requestQuotes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="h-8 w-8 text-gray-400" />
                                            <p>No request quotes found</p>
                                            <p className="text-xs">Quotes will appear here when customers submit requests</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}