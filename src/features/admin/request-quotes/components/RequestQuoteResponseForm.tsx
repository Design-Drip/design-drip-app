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

interface PricingAnalysis {
    totalOriginalPrice: number;
    totalYourPrice: number;
    totalDiscount: number;
    totalDiscountPercentage: number;
    totalQuantity: number;
    sizeBreakdown: Array<{
        size: string;
        quantity: number;
        originalPricePerUnit: number;
        yourPricePerUnit: number;
        originalTotal: number;
        yourTotal: number;
        discount: number;
        discountPercentage: number;
        hasDiscount: boolean;
        additional_price: number;
    }>;
    hasPricing: boolean;
}

const responseFormSchema = z
    .object({
        status: z.enum(["reviewing", "quoted", "rejected"]),
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
    })
    .refine(
        (data) => {
            if (data.status === "quoted") {
                return data.quotedPrice && parseFloat(data.quotedPrice) > 0;
            }
            return true;
        },
        {
            message: "Quoted price is required when status is 'quoted'",
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
                color_value?: string;
            } | string;
            quantityBySize?: Array<{
                size: string;
                quantity: number;
                additional_price?: number;
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
        };
        productionDetails?: {
            estimatedDays?: number;
            printingMethod?: PrintingMethod;
        };
        validUntil?: string;
    };
    initialStatus?: string;
    onSubmit: (data: ResponseFormData) => Promise<void>;
    isLoading: boolean;
}

export default function RequestQuoteResponseForm({
    open,
    onOpenChange,
    quote,
    initialStatus,
    onSubmit,
    isLoading,
}: RequestQuoteResponseFormProps) {
    const [showPriceBreakdown, setShowPriceBreakdown] = React.useState(false);

    // ✅ Get base price from productDetails
    const baseProductPrice = React.useMemo(() => {
        if (!quote.productDetails?.productId) return 0;
        return typeof quote.productDetails.productId === 'string'
            ? 0
            : quote.productDetails.productId.base_price || 0;
    }, [quote.productDetails]);

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

    // ✅ Calculate pricing using additional_price from quantityBySize
    const pricingAnalysis = React.useMemo((): PricingAnalysis => {
        if (!quote.productDetails?.quantityBySize || !Array.isArray(quote.productDetails.quantityBySize)) {
            return {
                totalOriginalPrice: 0,
                totalYourPrice: 0,
                totalDiscount: 0,
                totalDiscountPercentage: 0,
                totalQuantity: quote.productDetails?.quantity || 0,
                sizeBreakdown: [],
                hasPricing: false
            };
        }

        const basePrice = parseFloat(form.watch("basePrice") || "0");
        let totalOriginalPrice = 0;
        let totalYourPrice = 0;
        let totalQuantity = 0;

        const sizeBreakdown = quote.productDetails.quantityBySize.map(sizeItem => {
            // ✅ Use additional_price from API data in quantityBySize
            const originalPricePerUnit = baseProductPrice + (sizeItem.additional_price || 0);
            const yourPricePerUnit = basePrice;
            const quantity = sizeItem.quantity;

            const originalTotal = originalPricePerUnit * quantity;
            const yourTotal = yourPricePerUnit * quantity;
            const discount = originalTotal - yourTotal;
            const discountPercentage = originalTotal > 0 ? (discount / originalTotal) * 100 : 0;

            totalOriginalPrice += originalTotal;
            totalYourPrice += yourTotal;
            totalQuantity += quantity;

            return {
                size: sizeItem.size,
                quantity,
                originalPricePerUnit,
                yourPricePerUnit,
                originalTotal,
                yourTotal,
                discount,
                discountPercentage,
                hasDiscount: discount > 0,
                additional_price: sizeItem.additional_price || 0
            };
        });

        return {
            totalOriginalPrice,
            totalYourPrice,
            totalDiscount: totalOriginalPrice - totalYourPrice,
            totalDiscountPercentage: totalOriginalPrice > 0 ? ((totalOriginalPrice - totalYourPrice) / totalOriginalPrice) * 100 : 0,
            totalQuantity,
            sizeBreakdown,
            hasPricing: true
        };
    }, [quote.productDetails, baseProductPrice, form.watch("basePrice")]);

    // Additional fees
    const setupFee = parseFloat(form.watch("setupFee") || "0");
    const designFee = parseFloat(form.watch("designFee") || "0");
    const rushFee = parseFloat(form.watch("rushFee") || "0");
    const shippingCost = parseFloat(form.watch("shippingCost") || "0");
    const tax = parseFloat(form.watch("tax") || "0");

    const calculatedTotal = React.useMemo(() => {
        const subtotal = pricingAnalysis.totalYourPrice + setupFee + designFee + rushFee + shippingCost;
        return subtotal + tax;
    }, [pricingAnalysis.totalYourPrice, setupFee, designFee, rushFee, shippingCost, tax]);

    // Get total quantity and size breakdown for display
    const quantityInfo = React.useMemo(() => {
        if (!quote.productDetails?.quantityBySize || !Array.isArray(quote.productDetails.quantityBySize)) {
            return {
                totalQuantity: quote.productDetails?.quantity || 1,
                sizeBreakdown: [],
                hasSizeBreakdown: false
            };
        }

        const totalQuantity = quote.productDetails.quantityBySize.reduce((total, item) => {
            return total + item.quantity;
        }, 0);

        return {
            totalQuantity,
            sizeBreakdown: quote.productDetails.quantityBySize,
            hasSizeBreakdown: true
        };
    }, [quote.productDetails]);

    useEffect(() => {
        if (calculatedTotal > 0) {
            form.setValue("quotedPrice", calculatedTotal.toFixed(0));
        }
    }, [calculatedTotal, form]);

    const handleSubmit = async (data: ResponseFormData) => {
        await onSubmit(data);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>Create Admin Response</AlertDialogTitle>
                    <AlertDialogDescription>
                        Provide a detailed response to this quote request. Total quantity: {quantityInfo.totalQuantity} items{quantityInfo.hasSizeBreakdown ? ` across ${quantityInfo.sizeBreakdown.length} sizes` : ''}.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* ✅ Enhanced Product Summary with additional_price information */}
                {quote.productDetails && (
                    <div className="p-4 bg-muted/30 rounded-lg mb-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Product Summary
                        </h4>
                        <div className="text-sm space-y-2">
                            <div>Total Quantity: <span className="font-medium">{quantityInfo.totalQuantity}</span></div>

                            {pricingAnalysis.hasPricing && pricingAnalysis.sizeBreakdown.length > 0 && (
                                <div className="space-y-2">
                                    <div className="font-medium">Size Breakdown & Pricing:</div>
                                    <div className="grid gap-2">
                                        {pricingAnalysis.sizeBreakdown.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-white/50 rounded border text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Size {item.size}:</span>
                                                    <span>{item.quantity} items</span>
                                                    {/* ✅ Show additional_price */}
                                                    <span className="text-blue-600 text-xs">
                                                        (+{item.additional_price.toLocaleString('vi-VN')} VNĐ)
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="line-through text-muted-foreground">
                                                        {item.originalPricePerUnit.toLocaleString('vi-VN')} VNĐ/item
                                                    </div>
                                                    <div className="font-medium text-green-600">
                                                        {item.yourPricePerUnit.toLocaleString('vi-VN')} VNĐ/item
                                                    </div>
                                                    {item.hasDiscount && (
                                                        <div className="text-orange-600 font-medium">
                                                            Save {item.discount.toLocaleString('vi-VN')} VNĐ ({item.discountPercentage.toFixed(1)}%)
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total discount summary */}
                                    {pricingAnalysis.totalDiscount > 0 && (
                                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="text-sm font-medium text-green-800 mb-1">
                                                Customer Savings Summary:
                                            </div>
                                            <div className="text-xs text-green-700 space-y-1">
                                                <div>Original Total: {pricingAnalysis.totalOriginalPrice.toLocaleString('vi-VN')} VNĐ</div>
                                                <div>Your Quote Total: {pricingAnalysis.totalYourPrice.toLocaleString('vi-VN')} VNĐ</div>
                                                <div className="font-bold text-green-800 text-sm">
                                                    Total Savings: {pricingAnalysis.totalDiscount.toLocaleString('vi-VN')} VNĐ
                                                    ({pricingAnalysis.totalDiscountPercentage.toFixed(1)}% off)
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Pricing Section */}
                        {currentStatus === "quoted" && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-lg">
                                            Pricing Details ({quantityInfo.totalQuantity} items)
                                            {pricingAnalysis.totalDiscount > 0 && (
                                                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                                                    {pricingAnalysis.totalDiscountPercentage.toFixed(1)}% off retail
                                                </Badge>
                                            )}
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

                                    {/* Enhanced price breakdown with additional_price details */}
                                    {showPriceBreakdown && (
                                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
                                            <FormField
                                                control={form.control}
                                                name="basePrice"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Your Price Per Unit (VNĐ)</FormLabel>
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
                                                            {pricingAnalysis.totalYourPrice > 0 && (
                                                                <div className="space-y-2">
                                                                    <div>Your total: <span className="font-medium">{pricingAnalysis.totalYourPrice.toLocaleString('vi-VN')} VNĐ</span></div>
                                                                    {pricingAnalysis.hasPricing && pricingAnalysis.sizeBreakdown.length > 0 && (
                                                                        <div className="text-xs space-y-1">
                                                                            <div className="font-medium text-blue-600 mb-1">Size-specific pricing:</div>
                                                                            {pricingAnalysis.sizeBreakdown.map((item, index) => (
                                                                                <div key={index} className="flex justify-between">
                                                                                    <span>
                                                                                        Size {item.size} ({item.quantity}x):
                                                                                        <span className="text-blue-500 ml-1">
                                                                                            +{item.additional_price.toLocaleString('vi-VN')}
                                                                                        </span>
                                                                                    </span>
                                                                                    <div className="text-right">
                                                                                        <div className="line-through text-muted-foreground">
                                                                                            {item.originalTotal.toLocaleString('vi-VN')}
                                                                                        </div>
                                                                                        <div className="font-medium">
                                                                                            {item.yourTotal.toLocaleString('vi-VN')} VNĐ
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {pricingAnalysis.totalDiscount > 0 && (
                                                                        <div className="text-green-600 font-medium text-sm">
                                                                            Customer saves: {pricingAnalysis.totalDiscount.toLocaleString('vi-VN')} VNĐ vs retail
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

                                    {/* Enhanced Total Price with savings info */}
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
                                                    <FormDescription className="space-y-2">
                                                        <div className="font-medium text-green-700 text-base">
                                                            Calculated Total: {calculatedTotal.toLocaleString('vi-VN')} VNĐ
                                                        </div>

                                                        {/* Customer savings highlight */}
                                                        {pricingAnalysis.totalDiscount > 0 && (
                                                            <div className="p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                                                                <div className="font-medium text-orange-800 mb-1">Customer Value:</div>
                                                                <div className="text-orange-700 text-xs space-y-1">
                                                                    <div>Retail Price: {(pricingAnalysis.totalOriginalPrice + setupFee + designFee + rushFee + shippingCost + tax).toLocaleString('vi-VN')} VNĐ</div>
                                                                    <div>Your Quote: {calculatedTotal.toLocaleString('vi-VN')} VNĐ</div>
                                                                    <div className="font-bold text-orange-800">
                                                                        Total Savings: {((pricingAnalysis.totalOriginalPrice + setupFee + designFee + rushFee + shippingCost + tax) - calculatedTotal).toLocaleString('vi-VN')} VNĐ
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="text-xs text-muted-foreground space-y-1">
                                                            <div>• Base Total: {pricingAnalysis.totalYourPrice.toLocaleString('vi-VN')} VNĐ ({quantityInfo.totalQuantity} items)</div>
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
                                Submit Response
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}