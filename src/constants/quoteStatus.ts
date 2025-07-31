// Main quote statuses
export type QuoteStatus = "pending" | "reviewing" | "quoted" | "approved" | "rejected" | "completed";

export const QUOTE_STATUSES: QuoteStatus[] = [
    "pending", 
    "reviewing", 
    "quoted", 
    "approved", 
    "rejected", 
    "completed"
];

// Admin response statuses (used in adminResponses array)
export type AdminResponseStatus = "reviewing" | "quoted" | "revised" | "approved" | "rejected";

export const ADMIN_RESPONSE_STATUSES: AdminResponseStatus[] = [
    "reviewing",
    "quoted", 
    "revised", 
    "approved", 
    "rejected"
];

// Revision reasons
export type RevisionReason = "customer_request" | "admin_improvement" | "cost_change" | "timeline_change" | "material_change";

export const REVISION_REASONS: RevisionReason[] = [
    "customer_request",
    "admin_improvement", 
    "cost_change", 
    "timeline_change", 
    "material_change"
];

// Requested change aspects
export type RequestedChangeAspect = "price" | "timeline" | "materials" | "design" | "other";

export const REQUESTED_CHANGE_ASPECTS: RequestedChangeAspect[] = [
    "price",
    "timeline", 
    "materials", 
    "design", 
    "other"
];

// Printing methods
export type PrintingMethod = "DTG" | "DTF" | "Screen Print" | "Vinyl" | "Embroidery";

export const PRINTING_METHODS: PrintingMethod[] = [
    "DTG",
    "DTF", 
    "Screen Print", 
    "Vinyl", 
    "Embroidery"
];