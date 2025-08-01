"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Edit,
    MoreHorizontal,
    DollarSign,
    CheckCircle,
    XCircle,
    MessageSquare,
    ExternalLink,
    UserPlus,
    UserMinus,
} from "lucide-react";
import { useUpdateRequestQuoteStatusMutation } from "@/features/admin/request-quotes/services/mutations";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect } from "react";

interface QuoteActionsProps {
    quote: {
        id: string;
        status: string;
        quotedPrice?: number;
        adminNotes?: string;
        designerId?: string;
    };
}

export function QuoteActions({ quote }: QuoteActionsProps) {
    const [showQuoteDialog, setShowQuoteDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showNotesDialog, setShowNotesDialog] = useState(false);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [designerIdInput, setDesignerIdInput] = useState("");

    const [quotePrice, setQuotePrice] = useState(quote.quotedPrice?.toString() || "");
    const [rejectionReason, setRejectionReason] = useState("");
    const [adminNotes, setAdminNotes] = useState(quote.adminNotes || "");

    const [designers, setDesigners] = useState<{ id: string; name: string; email: string; imageUrl: string }[]>([]);
    const [loadingDesigners, setLoadingDesigners] = useState(false);

    useEffect(() => {
        if (showAssignDialog) {
            setLoadingDesigners(true);
            fetch("/api/designers")
                .then(res => res.json())
                .then(data => {
                    console.log("Fetched designers:", data);
                    setDesigners(data);
                })
                .catch(() => setDesigners([]))
                .finally(() => setLoadingDesigners(false));
        }
    }, [showAssignDialog]);

    const updateStatusMutation = useUpdateRequestQuoteStatusMutation();

    // ✅ Simple status updates (only status field)
    const handleSimpleStatusUpdate = async (status: "reviewing" | "approved" | "completed") => {
        try {
            await updateStatusMutation.mutateAsync({
                id: quote.id,
                status,
            });
            toast.success(`Status updated to ${status}`);
        } catch (error) {
            toast.error("Failed to update status");
            console.error("Error updating status:", error);
        }
    };

    // ✅ Quote with price
    const handleQuoteSubmit = async () => {
        if (!quotePrice || isNaN(Number(quotePrice))) {
            toast.error("Please enter a valid price");
            return;
        }

        try {
            await updateStatusMutation.mutateAsync({
                id: quote.id,
                status: "quoted",
                quotedPrice: Number(quotePrice),
            });
            toast.success("Quote submitted successfully");
            setShowQuoteDialog(false);
        } catch (error) {
            toast.error("Failed to submit quote");
            console.error("Error submitting quote:", error);
        }
    };

    // ✅ Reject with reason
    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }

        try {
            await updateStatusMutation.mutateAsync({
                id: quote.id,
                status: "rejected",
                rejectionReason: rejectionReason.trim(),
            });
            toast.success("Request quote rejected");
            setShowRejectDialog(false);
        } catch (error) {
            toast.error("Failed to reject quote");
            console.error("Error rejecting quote:", error);
        }
    };

    // ✅ Update admin notes only
    const handleNotesSubmit = async () => {
        try {
            await updateStatusMutation.mutateAsync({
                id: quote.id,
                status: quote.status as any, // Keep current status
                adminNotes: adminNotes.trim(),
            });
            toast.success("Admin notes updated");
            setShowNotesDialog(false);
        } catch (error) {
            toast.error("Failed to update notes");
            console.error("Error updating notes:", error);
        }
    };

    const handleAssignDesigner = async () => {
        if (!designerIdInput) {
            toast.error("Please select a designer");
            return;
        }
        setAssigning(true);
        try {
            const res = await fetch(`/api/request-quotes/${quote.id}/assign-designer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ designerId: designerIdInput }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to assign");
            toast.success("Assigned designer successfully");
            setShowAssignDialog(false);
            setDesignerIdInput("");
            window.location.reload();
        } catch (e: any) {
            toast.error(e.message || "Failed to assign");
        } finally {
            setAssigning(false);
        }
    };

    const handleUnassignDesigner = async () => {
        setAssigning(true);
        try {
            const res = await fetch(`/api/request-quotes/${quote.id}/unassign-designer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to unassign");
            toast.success("Unassigned designer successfully");
            window.location.reload();
        } catch (e: any) {
            toast.error(e.message || "Failed to unassign");
        } finally {
            setAssigning(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={updateStatusMutation.isPending}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                        <Link href={`/admin/request-quotes/${quote.id}`} className="cursor-pointer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Full Details
                        </Link>
                    </DropdownMenuItem>

                    {quote.status === "pending" && (
                        <DropdownMenuItem onClick={() => handleSimpleStatusUpdate("reviewing")}>
                            <Edit className="mr-2 h-4 w-4" />
                            Start Reviewing
                        </DropdownMenuItem>
                    )}

                    {quote.status === "quoted" && (
                        <DropdownMenuItem onClick={() => handleSimpleStatusUpdate("approved")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Approved
                        </DropdownMenuItem>
                    )}

                    {quote.status === "approved" && (
                        <DropdownMenuItem onClick={() => handleSimpleStatusUpdate("completed")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Completed
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    {!quote.designerId ? (
                        <DropdownMenuItem onClick={() => setShowAssignDialog(true)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign Designer
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onClick={handleUnassignDesigner}>
                            <UserMinus className="mr-2 h-4 w-4" />
                            Unassign Designer
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => setShowNotesDialog(true)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {quote.adminNotes ? "Edit Notes" : "Add Notes"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Quote Dialog */}
            <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Provide Quote</DialogTitle>
                        <DialogDescription>
                            Enter the quoted price for this request.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="price">Quote Price (VND)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={quotePrice}
                                onChange={(e) => setQuotePrice(e.target.value)}
                                placeholder="Enter price in VND"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowQuoteDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleQuoteSubmit}
                            disabled={updateStatusMutation.isPending}
                        >
                            {updateStatusMutation.isPending ? "Submitting..." : "Submit Quote"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Request</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this request.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="reason">Rejection Reason</Label>
                            <Textarea
                                id="reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter reason for rejection..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectSubmit}
                            disabled={updateStatusMutation.isPending}
                        >
                            {updateStatusMutation.isPending ? "Rejecting..." : "Reject Request"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Admin Notes Dialog */}
            <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{quote.adminNotes ? "Edit" : "Add"} Admin Notes</DialogTitle>
                        <DialogDescription>
                            Add internal notes for this request quote.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="notes">Admin Notes</Label>
                            <Textarea
                                id="notes"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Enter admin notes..."
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleNotesSubmit}
                            disabled={updateStatusMutation.isPending}
                        >
                            {updateStatusMutation.isPending ? "Saving..." : "Save Notes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Designer Dialog */}
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Designer</DialogTitle>
                        <DialogDescription>
                            Chọn designer để assign request quote này.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="designerId">Designer</Label>
                            <Select
                                value={designerIdInput}
                                onValueChange={setDesignerIdInput}
                                disabled={loadingDesigners}
                            >
                                <SelectTrigger id="designerId">
                                    <SelectValue placeholder={loadingDesigners ? "Đang tải..." : "Chọn designer"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {designers.map(designer => (
                                        <SelectItem key={designer.id} value={designer.id}>
                                            {designer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssignDesigner} disabled={assigning || !designerIdInput}>
                            {assigning ? "Assigning..." : "Assign"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}