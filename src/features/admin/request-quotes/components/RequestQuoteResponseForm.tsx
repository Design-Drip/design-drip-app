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
    Palette,
    Edit,
    ImageIcon,
    Ruler,
    AlertTriangle,
    Upload,
    X
} from "lucide-react";
import { PrintingMethod } from "@/constants/quoteStatus";
import { UploadDropzone } from "@/lib/uploadthing";
import { toast } from 'sonner';

const responseFormSchema = z
    .object({
        status: z.enum(["reviewing", "quoted", "revised", "rejected"]),
        quotedPrice: z.string().optional(),
        responseMessage: z.string().optional(),
        rejectionReason: z.string().optional(),
        adminNotes: z.string().optional(),

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
        responseMessage?: string;
        rejectionReason?: string;
        adminNotes?: string;
        artwork?: string;
        desiredWidth?: number;
        desiredHeight?: number;
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
            responseMessage: quote.responseMessage || "",
            rejectionReason: quote.rejectionReason || "",
            adminNotes: quote.adminNotes || "",
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

    const basePrice = parseFloat(form.watch("basePrice") || "0");
    const setupFee = parseFloat(form.watch("setupFee") || "0");
    const designFee = parseFloat(form.watch("designFee") || "0");
    const rushFee = parseFloat(form.watch("rushFee") || "0");
    const shippingCost = parseFloat(form.watch("shippingCost") || "0");
    const tax = parseFloat(form.watch("tax") || "0");
    const calculatedTotal = basePrice + setupFee + designFee + rushFee + shippingCost + tax;

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
                            : `Provide a detailed response to this quote request.`
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>

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
                                        <h4 className="font-medium text-lg">Pricing Details</h4>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                                        >
                                            {showPriceBreakdown ? "Hide" : "Show"} Price Breakdown
                                        </Button>
                                    </div>

                                    {/* ✅ UPDATED: Price Breakdown Fields (VNĐ) */}
                                    {showPriceBreakdown && (
                                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
                                            <FormField
                                                control={form.control}
                                                name="basePrice"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Base Price (VNĐ)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="1000"
                                                                min="0"
                                                                placeholder="0"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="setupFee"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Setup Fee (VNĐ)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="1000"
                                                                min="0"
                                                                placeholder="0"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="designFee"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Design Fee (VNĐ)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="1000"
                                                                min="0"
                                                                placeholder="0"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="rushFee"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Rush Fee (VNĐ)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="1000"
                                                                min="0"
                                                                placeholder="0"
                                                                {...field}
                                                            />
                                                        </FormControl>
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
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}

                                    {/* Total Price */}
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
                                                    <FormDescription>
                                                        Calculated from breakdown: {calculatedTotal.toLocaleString('vi-VN')} VNĐ
                                                    </FormDescription>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* ✅ ENHANCED: Production Details with Custom-specific fields */}
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
                                                                placeholder={"7"}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Business days needed for production
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
                                                        <FormLabel>
                                                            Printing Method
                                                        </FormLabel>
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
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* ✅ NEW: Valid Until Date */}
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