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
        materialSpecs: z.string().optional(),
        colorLimitations: z.string().optional(),

        validUntil: z.string().optional(),
        revisionReason: z.enum(["customer_request", "admin_improvement", "cost_change", "timeline_change", "material_change"]).optional(),
        
        // ✅ NEW: Admin images for custom quotes
        adminImages: z.array(z.string().url()).optional(),
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
        type: "product" | "custom";
        customRequest?: {
            customNeed: string;
        };
        artwork?: string;
        artworkInstructions?: string;
        desiredWidth?: number;
        desiredHeight?: number;
        // ✅ NEW: Admin response images for custom quotes
        adminImages?: string[];
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
            materialSpecs?: string;
            colorLimitations?: string;
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
    // ✅ NEW: State for admin uploaded images
    const [adminImages, setAdminImages] = React.useState<string[]>(quote.adminImages || []);

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
            materialSpecs: quote.productionDetails?.materialSpecs || "",
            colorLimitations: quote.productionDetails?.colorLimitations || "",
            validUntil: quote.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            adminImages: quote.adminImages || [],
        },
    });

    // ✅ NEW: Update form when adminImages change
    React.useEffect(() => {
        form.setValue("adminImages", adminImages);
    }, [adminImages, form]);

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
        // ✅ NEW: Include admin images in submission data for custom quotes
        const submissionData = {
            ...data,
            ...(quote.type === "custom" && { adminImages })
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
                            : `Provide a detailed response to this ${quote.type} quote request.`
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* ✅ NEW: Custom Request Summary with Image Upload */}
                {quote.type === "custom" && quote.customRequest && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Edit className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-blue-900 mb-2">Custom Request Details</h4>
                                <div className="bg-white p-3 rounded border border-blue-200">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {quote.customRequest.customNeed}
                                    </p>
                                </div>

                                {/* Customer provided artwork and dimensions */}
                                {(quote.artwork || quote.desiredWidth || quote.desiredHeight) && (
                                    <div className="mt-3 space-y-2">
                                        {quote.artwork && (
                                            <div className="flex items-center gap-2 text-sm text-blue-700">
                                                <ImageIcon className="h-4 w-4" />
                                                <span>Customer provided artwork</span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(quote.artwork, '_blank')}
                                                    className="h-6 px-2 text-xs"
                                                >
                                                    View
                                                </Button>
                                            </div>
                                        )}
                                        
                                        {(quote.desiredWidth || quote.desiredHeight) && (
                                            <div className="flex items-center gap-2 text-sm text-blue-700">
                                                <Ruler className="h-4 w-4" />
                                                <span>
                                                    Desired size: {quote.desiredWidth ? `${quote.desiredWidth}"W` : ''} 
                                                    {quote.desiredWidth && quote.desiredHeight ? ' × ' : ''}
                                                    {quote.desiredHeight ? `${quote.desiredHeight}"H` : ''}
                                                </span>
                                            </div>
                                        )}

                                        {quote.artworkInstructions && (
                                            <div className="text-sm text-blue-700">
                                                <span className="font-medium">Instructions: </span>
                                                {quote.artworkInstructions}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ✅ NEW: Admin Image Upload Section */}
                                <Separator className="my-4" />
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h5 className="font-medium text-blue-900 flex items-center gap-2">
                                            <Upload className="h-4 w-4" />
                                            Admin Response Images
                                        </h5>
                                        <span className="text-xs text-blue-600">
                                            {adminImages.length}/5 images
                                        </span>
                                    </div>
                                    
                                    <p className="text-xs text-blue-700">
                                        Upload images showing proposed products, mockups, or design concepts based on the customer's request
                                    </p>

                                    {/* Image Grid */}
                                    {adminImages.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                                            {adminImages.map((imageUrl, index) => (
                                                <div key={index} className="relative group">
                                                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-blue-200">
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Admin response ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            const newImages = adminImages.filter((_, i) => i !== index);
                                                            setAdminImages(newImages);
                                                            toast.success("Image removed");
                                                        }}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload Area */}
                                    {adminImages.length < 5 && (
                                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-3">
                                            <UploadDropzone
                                                endpoint="designCanvas"
                                                onClientUploadComplete={(res) => {
                                                    if (res && res[0]) {
                                                        const newImages = [...adminImages, res[0].url];
                                                        setAdminImages(newImages);
                                                        toast.success("Image uploaded successfully!");
                                                    }
                                                }}
                                                onUploadError={(error: Error) => {
                                                    toast.error("Upload failed: " + error.message);
                                                }}
                                                appearance={{
                                                    container: "p-2",
                                                    uploadIcon: "text-blue-400 h-6 w-6",
                                                    label: "text-blue-600 text-xs",
                                                    allowedContent: "text-xs text-blue-500"
                                                }}
                                            />
                                        </div>
                                    )}

                                    {adminImages.length >= 5 && (
                                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                                            Maximum 5 images allowed. Remove some images to upload more.
                                        </div>
                                    )}
                                </div>
                            </div>
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

                        {/* ✅ ENHANCED: Response Message for Custom Quotes */}
                        <FormField
                            control={form.control}
                            name="responseMessage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Response Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={quote.type === "custom" 
                                                ? "Explain how you can fulfill this custom request, any clarifications needed, or alternative suggestions..."
                                                : "Provide a message to the customer..."
                                            }
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {quote.type === "custom" 
                                            ? "For custom requests, be specific about what you can deliver and any requirements"
                                            : "This message will be visible to the customer"
                                        }
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ✅ NEW: Revision Reason (only for revisions) */}
                        {mode === "revise" && (
                            <FormField
                                control={form.control}
                                name="revisionReason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Revision Reason</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select revision reason" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="customer_request">Customer Request</SelectItem>
                                                <SelectItem value="admin_improvement">Admin Improvement</SelectItem>
                                                <SelectItem value="cost_change">Cost Change</SelectItem>
                                                <SelectItem value="timeline_change">Timeline Change</SelectItem>
                                                <SelectItem value="material_change">Material Change</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Why are you creating this revision?
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* ✅ NEW: Custom Quote Specific Guidelines */}
                        {quote.type === "custom" && (currentStatus === "quoted" || currentStatus === "revised") && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    <span className="font-medium text-amber-800">Custom Quote Guidelines</span>
                                </div>
                                <ul className="text-sm text-amber-700 space-y-1">
                                    <li>• Upload reference images showing proposed products or concepts</li>
                                    <li>• Clearly specify what products/services are included</li>
                                    <li>• Include any design or setup requirements</li>
                                    <li>• Mention if customer artwork needs modifications</li>
                                    <li>• Set realistic production timelines for custom work</li>
                                    <li>• Include any limitations or special requirements</li>
                                </ul>
                            </div>
                        )}

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
                                                                placeholder={quote.type === "custom" ? "14" : "7"}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            {quote.type === "custom" 
                                                                ? "Custom orders typically take longer (recommended: 10-21 days)"
                                                                : "Business days needed for production"
                                                            }
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
                                                            {quote.type === "custom" ? "Recommended Method" : "Printing Method"}
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

                                        <FormField
                                            control={form.control}
                                            name="materialSpecs"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {quote.type === "custom" ? "Proposed Materials & Specifications" : "Material Specifications"}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={quote.type === "custom" 
                                                                ? "Describe the materials, products, and specifications you recommend for this custom request..."
                                                                : "Describe materials, fabric type, quality, etc..."
                                                            }
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        {quote.type === "custom" 
                                                            ? "Be detailed about what products and materials will be used"
                                                            : "Details about materials and fabric specifications"
                                                        }
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="colorLimitations"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Color Limitations & Requirements</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={quote.type === "custom" 
                                                                ? "Any color limitations, artwork modifications needed, or color matching requirements..."
                                                                : "Any color restrictions, limitations, or requirements..."
                                                            }
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Explain any color-related constraints or requirements
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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

                        {/* Admin Notes */}
                        <Separator />
                        <FormField
                            control={form.control}
                            name="adminNotes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Admin Notes (Internal Only)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any internal notes or comments for other admins..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Internal notes for administrative reference (not visible to customer)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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