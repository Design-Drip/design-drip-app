"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Clock,
    DollarSign,
    CheckCircle,
    XCircle,
    Eye,
    FileCheck,
    Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/price";
import { useUpdateRequestQuoteStatusMutation } from "../services/mutations";
import { toast } from "sonner";

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
    createdAt: string;
    updatedAt: string;
}

interface RequestQuoteStatusUpdateProps {
    quote: RequestQuote;
}

// Form schema
const statusUpdateSchema = z
    .object({
        status: z.enum(["pending", "reviewing", "quoted", "approved", "rejected", "completed"]),
        quotedPrice: z.string().optional(),
        rejectionReason: z.string().optional(),
        adminNotes: z.string().optional(),
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

type StatusUpdateForm = z.infer<typeof statusUpdateSchema>;

// Status configurations
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
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();

    const form = useForm<StatusUpdateForm>({
        resolver: zodResolver(statusUpdateSchema),
        defaultValues: {
            status: quote.status,
            quotedPrice: quote.quotedPrice?.toString() || "",
            rejectionReason: quote.rejectionReason || "",
            adminNotes: quote.adminNotes || "",
        },
    });

    const currentStatus = form.watch("status");
    const currentStatusConfig = getStatusConfig(currentStatus);
    const StatusIcon = currentStatusConfig.icon;

    const updateStatusMutation = useUpdateRequestQuoteStatusMutation();

    const onSubmit = async (data: StatusUpdateForm) => {
        setIsLoading(true);
        try {
            const result = await updateStatusMutation.mutateAsync({
                id: quote.id,
                status,
            });

            if (result.success) {
                toast.success("Request quote status updated successfully")
                router.refresh();
                setIsDialogOpen(false);
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error)
        } finally {
            setIsLoading(false);
        }
    };

    const getNextSteps = (status: string) => {
        switch (status) {
            case "pending":
                return ["reviewing", "quoted", "rejected"];
            case "reviewing":
                return ["quoted", "rejected"];
            case "quoted":
                return ["approved", "rejected"];
            case "approved":
                return ["completed"];
            case "rejected":
                return ["reviewing"];
            case "completed":
                return [];
            default:
                return [];
        }
    };

    const nextSteps = getNextSteps(quote.status);

    return (
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
                    <Badge variant="outline" className={currentStatusConfig.color}>
                        {currentStatusConfig.label}
                    </Badge>
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

                    {/* Current Quote Price */}
                    {quote.quotedPrice && (
                        <div>
                            <h4 className="font-medium mb-2">Current Quote Price</h4>
                            <p className="text-2xl font-bold text-green-600">
                                {formatPrice(quote.quotedPrice)}
                            </p>
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
                                        onClick={() => {
                                            form.setValue("status", status as any);
                                            setIsDialogOpen(true);
                                        }}
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

                {/* Update Form Dialog */}
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full">Update Status</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Update Request Quote Status</AlertDialogTitle>
                            <AlertDialogDescription>
                                Update the status and provide additional information for this quote request.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {/* Status Selection */}
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="reviewing">Reviewing</SelectItem>
                                                    <SelectItem value="quoted">Quoted</SelectItem>
                                                    <SelectItem value="approved">Approved</SelectItem>
                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Quote Price (if status is quoted) */}
                                {currentStatus === "quoted" && (
                                    <FormField
                                        control={form.control}
                                        name="quotedPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quote Price ($)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0.00"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Enter the quoted price for this request
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {/* Rejection Reason (if status is rejected) */}
                                {currentStatus === "rejected" && (
                                    <FormField
                                        control={form.control}
                                        name="rejectionReason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Rejection Reason</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Please provide a reason for rejection..."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Explain why this request is being rejected
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {/* Admin Notes */}
                                <FormField
                                    control={form.control}
                                    name="adminNotes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Admin Notes (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Add any internal notes or comments..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Internal notes for administrative reference
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <AlertDialogFooter>
                                    <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                                    <AlertDialogAction type="submit" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Update Status
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </form>
                        </Form>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}