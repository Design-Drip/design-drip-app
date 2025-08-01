"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  FileEdit,
  DollarSign,
  Package,
  Loader2
} from "lucide-react";
import { formatPrice } from "@/lib/price";

interface AdminResponse {
  id: string;
  status: string;
  responseMessage?: string;
  quotedPrice?: number;
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
    printingMethod?: string;
    materialSpecs?: string;
    colorLimitations?: string;
  };
  validUntil?: string;
  version: number;
  createdAt: string;
}

interface RequestChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminResponse: AdminResponse;
  onSubmit: (changes: {
    priceChanges?: string;
    designChanges?: string;
    timelineChanges?: string;
    otherChanges?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function RequestChangesDialog({
  open,
  onOpenChange,
  adminResponse,
  onSubmit,
  isLoading = false,
}: RequestChangesDialogProps) {
  const [changeRequests, setChangeRequests] = useState({
    priceChanges: "",
    designChanges: "",
    timelineChanges: "",
    otherChanges: "",
  });

  const handleInputChange = (field: keyof typeof changeRequests, value: string) => {
    setChangeRequests(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Filter out empty fields
    const filteredChanges = Object.fromEntries(
      Object.entries(changeRequests).filter(([_, value]) => value.trim() !== "")
    );

    if (Object.keys(filteredChanges).length === 0) {
      return; // No changes to submit
    }

    try {
      await onSubmit(filteredChanges);
      
      // Reset form on success
      setChangeRequests({
        priceChanges: "",
        designChanges: "",
        timelineChanges: "",
        otherChanges: "",
      });
    } catch (error) {
      // Error handling is done in parent component
      console.error("Error submitting changes:", error);
    }
  };

  const hasAnyChanges = Object.values(changeRequests).some(value => value.trim() !== "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Request Changes
          </DialogTitle>
          <DialogDescription>
            Let us know what changes you'd like to make to this quote. Be specific about what needs to be adjusted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Quote Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3 text-sm">Current Quote Summary</h4>
            <div className="space-y-2 text-sm">
              {adminResponse.quotedPrice && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Price
                  </span>
                  <Badge variant="secondary">
                    {formatPrice(adminResponse.quotedPrice)}
                  </Badge>
                </div>
              )}
              
              {adminResponse.productionDetails?.estimatedDays && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Production Time
                  </span>
                  <Badge variant="secondary">
                    {adminResponse.productionDetails.estimatedDays} days
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Quote Version</span>
                <Badge variant="outline">v{adminResponse.version}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Change Request Form */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              What changes would you like to request?
            </h4>

            {/* Price Changes */}
            <div className="space-y-2">
              <Label htmlFor="priceChanges" className="text-sm font-medium">
                💰 Price & Budget Concerns
              </Label>
              <Textarea
                id="priceChanges"
                placeholder="e.g., 'The quoted price is higher than expected. Can we discuss alternatives or bulk discounts?'"
                value={changeRequests.priceChanges}
                onChange={(e) => handleInputChange("priceChanges", e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Design Changes */}
            <div className="space-y-2">
              <Label htmlFor="designChanges" className="text-sm font-medium">
                🎨 Design & Product Specifications
              </Label>
              <Textarea
                id="designChanges"
                placeholder="e.g., 'I'd like to change the design size, colors, or printing method. Can we discuss options?'"
                value={changeRequests.designChanges}
                onChange={(e) => handleInputChange("designChanges", e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Timeline Changes */}
            <div className="space-y-2">
              <Label htmlFor="timelineChanges" className="text-sm font-medium">
                ⏰ Timeline & Delivery
              </Label>
              <Textarea
                id="timelineChanges"
                placeholder="e.g., 'I need this completed sooner/later than estimated. Can we adjust the timeline?'"
                value={changeRequests.timelineChanges}
                onChange={(e) => handleInputChange("timelineChanges", e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Other Changes */}
            <div className="space-y-2">
              <Label htmlFor="otherChanges" className="text-sm font-medium">
                📝 Other Requests
              </Label>
              <Textarea
                id="otherChanges"
                placeholder="e.g., 'Any other specific requirements or questions about the quote...'"
                value={changeRequests.otherChanges}
                onChange={(e) => handleInputChange("otherChanges", e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2 text-sm">💡 Tips for better results:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be specific about what you'd like changed</li>
              <li>• Include your budget constraints if relevant</li>
              <li>• Mention any deadline requirements</li>
              <li>• Ask questions about alternatives or options</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasAnyChanges || isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}