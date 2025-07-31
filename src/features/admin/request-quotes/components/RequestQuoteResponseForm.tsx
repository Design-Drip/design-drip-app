"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Calendar,
    Package,
} from "lucide-react";
import { PrintingMethod } from "@/constants/quoteStatus";

const responseFormSchema = z
    .object({
        status: z.enum(["reviewing", "quoted", "revised", "rejected"]),
        quotedPrice: z.string().optional(),
        rejectionReason: z.string().optional(),

        basePrice: z.string().optional(),
        setupFee: z.string().optional(),
        designFee: z.string().optional(),
        rushFee: z.string().optional(),
        shippingCost: z.string().optional(),
        tax: z.string().optional(),

        estimatedDays: z.string().optional(),
        printingMethod: z.enum(["DTG", "DTF", "Screen Print", "Vinyl", "Embroidery"]).optional(),

        validUntil: z.string().optional(),
        revisionReason: z.enum(["customer_request", "admin_improvement", "cost_change", "timeline_change", "material_change"]).optional(),
    })
    .refine(
        (data) => {
            if (data.status === "quoted" || data.status === "revised") {
                return data.quotedPrice && parseFloat(data.quotedPrice) > 0;
            }
            return true;
        },
        {
            message: "Quoted price is required when status is 'quoted' or 'revised'",
            path: ["quotedPrice"],
        }
    )
    .refine(
        (data) => {
            if (data.status === "rejected") {
                return data.rejectionReason && data.rejectionReason.trim().length > 0;
            }
            return true;
        },
        {
            message: "Rejection reason is required when status is 'rejected'",
            path: ["rejectionReason"],
        }
    );

type ResponseFormData = z.infer<typeof responseFormSchema>;

interface RequestQuoteResponseFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    quote: {
        id: string;
        status: string;
        quotedPrice?: number;
        rejectionReason?: string;
        artwork?: string;
        desiredWidth?: number;
        desiredHeight?: number;

        productDetails?: {
            productId?: {
                _id: string;
                name: string;
                base_price?: number;
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
        };

        suburbCity?: string;
        state?: string;
        needDeliveryBy?: string;
        needDesignService?: boolean;

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
            printingMethod?: PrintingMethod;
        };
        validUntil?: string;
        currentVersion?: number;
        totalRevisions?: number;
    };
    initialStatus?: string;
    onSubmit: (data: ResponseFormData) => Promise<void>;
    isLoading: boolean;
    mode?: "respond" | "revise";
}

export default function RequestQuoteResponseForm({
    open,
    onOpenChange,
    quote,
    initialStatus,
    onSubmit,
    isLoading,
    mode = "respond"
}: RequestQuoteResponseFormProps) {
    const [showPriceBreakdown, setShowPriceBreakdown] = React.useState(false);

    const form = useForm<ResponseFormData>({
        resolver: zodResolver(responseFormSchema),
        defaultValues: {
            status: (initialStatus as any) || "reviewing",
            quotedPrice: quote.quotedPrice?.toString() || "",
            rejectionReason: quote.rejectionReason || "",
            basePrice: quote.priceBreakdown?.basePrice?.toString() || "",
            setupFee: quote.priceBreakdown?.setupFee?.toString() || "0",
            designFee: quote.priceBreakdown?.designFee?.toString() || "0",
            rushFee: quote.priceBreakdown?.rushFee?.toString() || "0",
            shippingCost: quote.priceBreakdown?.shippingCost?.toString() || "0",
            tax: quote.priceBreakdown?.tax?.toString() || "0",
            estimatedDays: quote.productionDetails?.estimatedDays?.toString() || "",
            printingMethod: quote.productionDetails?.printingMethod || undefined,
            validUntil: quote.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
    });

    useEffect(() => {
        if (open && initialStatus) {
            form.setValue("status", initialStatus as any);
        }
    }, [open, initialStatus, form]);

    const currentStatus = form.watch("status");

    //Get product details and calculate total based on actual size pricing
    const productDetails = React.useMemo(() => {
        if (!quote.productDetails) return null;
        return quote.productDetails;
    }, [quote.productDetails]);

    //Calculate base total from actual product sizes and quantities
    const baseTotal = React.useMemo(() => {
        if (!productDetails?.quantityBySize || !Array.isArray(productDetails.quantityBySize)) {
            // Fallback to simple quantity * base price if no size breakdown
            const quantity = productDetails?.quantity || 1;
            const basePrice = parseFloat(form.watch("basePrice") || "0");
            return quantity * basePrice;
        }

        // Calculate based on actual size quantities and their individual prices
        const basePrice = parseFloat(form.watch("basePrice") || "0");

        return productDetails.quantityBySize.reduce((total, sizeItem) => {
            // Here you would ideally get the actual price for each size
            // For now, using basePrice as the per-unit price for all sizes
            // In a real scenario, you'd fetch size-specific pricing
            const pricePerUnit = basePrice; // TODO: Get actual size-specific price
            return total + (sizeItem.quantity * pricePerUnit);
        }, 0);
    }, [productDetails, form.watch("basePrice")]);

    //Calculate total with proper size-based pricing
    const setupFee = parseFloat(form.watch("setupFee") || "0");
    const designFee = parseFloat(form.watch("designFee") || "0");
    const rushFee = parseFloat(form.watch("rushFee") || "0");
    const shippingCost = parseFloat(form.watch("shippingCost") || "0");
    const tax = parseFloat(form.watch("tax") || "0");

    const calculatedTotal = React.useMemo(() => {
        // Base total (already calculated per size)
        const subtotal = baseTotal + setupFee + designFee + rushFee + shippingCost;

        // Tax is calculated on subtotal
        return subtotal + tax;
    }, [baseTotal, setupFee, designFee, rushFee, shippingCost, tax]);

    //Get total quantity and size breakdown for display
    const quantityInfo = React.useMemo(() => {
        if (!productDetails?.quantityBySize || !Array.isArray(productDetails.quantityBySize)) {
            return {
                totalQuantity: productDetails?.quantity || 1,
                sizeBreakdown: [],
                hasSizeBreakdown: false
            };
        }

        const totalQuantity = productDetails.quantityBySize.reduce((total, item) => {
            return total + item.quantity;
        }, 0);

        return {
            totalQuantity,
            sizeBreakdown: productDetails.quantityBySize,
            hasSizeBreakdown: true
        };
    }, [productDetails]);

    useEffect(() => {
        if (calculatedTotal > 0) {
            form.setValue("quotedPrice", calculatedTotal.toFixed(0));
        }
    }, [calculatedTotal, form]);

    const handleSubmit = async (data: ResponseFormData) => {
        const submissionData = {
            ...data,
        };

        await onSubmit(submissionData);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {mode === "revise" ? "Create Revision" : "Create Admin Response"}
                        {quote.currentVersion && (
                            <Badge variant="secondary" className="ml-2">
                                Current: v{quote.currentVersion}
                                {quote.totalRevisions && quote.totalRevisions > 0 &&
                                    ` (${quote.totalRevisions} revisions)`
                                }
                            </Badge>
                        )}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {mode === "revise"
                            ? "Create a new revision of your response with updated information."
                            : `Provide a detailed response to this quote request. Total quantity: ${quantityInfo.totalQuantity} items${quantityInfo.hasSizeBreakdown ? ` across ${quantityInfo.sizeBreakdown.length} sizes` : ''}.`
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* ✅ NEW: Product Summary */}
                {productDetails && (
                    <div className="p-4 bg-muted/30 rounded-lg mb-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Product Summary
                        </h4>
                        <div className="text-sm space-y-1">
                            <div>Total Quantity: <span className="font-medium">{quantityInfo.totalQuantity}</span></div>
                            {quantityInfo.hasSizeBreakdown && (
                                <div>
                                    Size Breakdown: {quantityInfo.sizeBreakdown.map((item, index) => (
                                        <span key={index} className="inline-block mr-2">
                                            {item.size}: {item.quantity}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        {/* Status Selection */}
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Response Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="reviewing">Reviewing</SelectItem>
                                            <SelectItem value="quoted">Quoted</SelectItem>
                                            {mode === "revise" && (
                                                <SelectItem value="revised">Revised</SelectItem>
                                            )}
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Pricing Section */}
                        {(currentStatus === "quoted" || currentStatus === "revised") && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-lg">
                                            Pricing Details ({quantityInfo.totalQuantity} items)
                                        </h4>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                                        >
                                            {showPriceBreakdown ? "Hide" : "Show"} Price Breakdown
                                        </Button>
                                    </div>

                                    {/* ✅ UPDATED: Price Breakdown Fields with quantity context */}
                                    {showPriceBreakdown && (
                                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
                                            <FormField
                                                control={form.control}
                                                name="basePrice"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Base Price Per Unit (VNĐ)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="1000"
                                                                min="0"
                                                                placeholder="0"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            {baseTotal > 0 && (
                                                                <div className="space-y-1">
                                                                    <div>Total base cost: <span className="font-medium">{baseTotal.toLocaleString('vi-VN')} VNĐ</span></div>
                                                                    {quantityInfo.hasSizeBreakdown && (
                                                                        <div className="text-xs">
                                                                            {quantityInfo.sizeBreakdown.map((item, index) => (
                                                                                <div key={index}>
                                                                                    Size {item.size}: {item.quantity} × {parseFloat(field.value || "0").toLocaleString('vi-VN')} = {(item.quantity * parseFloat(field.value || "0")).toLocaleString('vi-VN')} VNĐ
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="setupFee"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Setup Fee (One-time, VNĐ)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="1000"
                                                                min="0"
                                                                placeholder="0"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            One-time setup cost for production
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="designFee"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Design Fee (One-time, VNĐ)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="1000"
                                                                min="0"
                                                                placeholder="0"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            {quote.needDesignService ? "Design service requested" : "Additional design work if needed"}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="rushFee"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Rush Fee (One-time, VNĐ)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="1000"
                                                                min="0"
                                                                placeholder="0"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            {quote.needDeliveryBy ? "Rush delivery requested" : "Additional fee for expedited service"}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="shippingCost"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Shipping Cost (VNĐ)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="1000"
                                                                min="0"
                                                                placeholder="0"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Shipping to: {quote.suburbCity}, {quote.state}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="tax"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tax (VNĐ)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="1000"
                                                                min="0"
                                                                placeholder="0"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            VAT or applicable taxes
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}

                                    {/* ✅ ENHANCED: Total Price with detailed breakdown */}
                                    <FormField
                                        control={form.control}
                                        name="quotedPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Total Quote Price (VNĐ)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="1000"
                                                        min="0"
                                                        placeholder="0"
                                                        {...field}
                                                        className="text-lg font-semibold"
                                                    />
                                                </FormControl>
                                                {calculatedTotal > 0 && (
                                                    <FormDescription className="space-y-1">
                                                        <div className="font-medium text-green-700 text-base">
                                                            Calculated Total: {calculatedTotal.toLocaleString('vi-VN')} VNĐ
                                                        </div>
                                                        <div className="text-xs text-muted-foreground space-y-1">
                                                            <div>• Base Total: {baseTotal.toLocaleString('vi-VN')} VNĐ ({quantityInfo.totalQuantity} items)</div>
                                                            {setupFee > 0 && <div>• Setup Fee: {setupFee.toLocaleString('vi-VN')} VNĐ</div>}
                                                            {designFee > 0 && <div>• Design Fee: {designFee.toLocaleString('vi-VN')} VNĐ</div>}
                                                            {rushFee > 0 && <div>• Rush Fee: {rushFee.toLocaleString('vi-VN')} VNĐ</div>}
                                                            {shippingCost > 0 && <div>• Shipping: {shippingCost.toLocaleString('vi-VN')} VNĐ</div>}
                                                            {tax > 0 && <div>• Tax: {tax.toLocaleString('vi-VN')} VNĐ</div>}
                                                            <div className="border-t pt-1 font-medium">
                                                                • Per Item Average: {(calculatedTotal / quantityInfo.totalQuantity).toLocaleString('vi-VN')} VNĐ
                                                            </div>
                                                        </div>
                                                    </FormDescription>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Production Details */}
                                    <Separator />
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-lg flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Production Details
                                        </h4>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="estimatedDays"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Estimated Production Days</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                placeholder="7"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Business days for {quantityInfo.totalQuantity} items
                                                            {quote.needDeliveryBy && (
                                                                <div className="text-orange-600 font-medium">
                                                                    Customer needs by: {new Date(quote.needDeliveryBy).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="printingMethod"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Printing Method</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select method" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="DTG">DTG (Direct to Garment)</SelectItem>
                                                                <SelectItem value="DTF">DTF (Direct to Film)</SelectItem>
                                                                <SelectItem value="Screen Print">Screen Print</SelectItem>
                                                                <SelectItem value="Vinyl">Vinyl</SelectItem>
                                                                <SelectItem value="Embroidery">Embroidery</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormDescription>
                                                            Best method for this quantity and design
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Valid Until Date */}
                                    <FormField
                                        control={form.control}
                                        name="validUntil"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Quote Valid Until
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    How long this quote remains valid for customer acceptance
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </>
                        )}

                        {/* Rejection Reason */}
                        {currentStatus === "rejected" && (
                            <>
                                <Separator />
                                <FormField
                                    control={form.control}
                                    name="rejectionReason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rejection Reason</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Please provide a clear reason for rejection..."
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Explain why this request is being rejected (visible to customer)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                            <AlertDialogAction type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {mode === "revise" ? "Create Revision" : "Submit Response"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}