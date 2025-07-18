export interface CreateRequestQuotePayload {
  // Customer information
  firstName: string;
  lastName: string;
  emailAddress: string;
  phone: string;
  company?: string;
  streetAddress: string;
  suburbCity: string;
  country: string;
  state: string;
  postcode: string;
  agreeTerms: boolean;
  
  // Request type and details
  type: "product" | "custom";
  
  // Product details (conditional)
  productId?: string;
  quantity?: number;
  selectedColorId?: string;
  quantityBySize?: Array<{
    size: string;
    quantity: number;
  }>;
  
  // Custom request details (conditional)
  customNeed?: string;
  
  // Delivery and additional information
  needDeliveryBy?: string;
  extraInformation?: string;
}

export interface UpdateRequestQuotePayload {
  status?: "pending" | "reviewing" | "quoted" | "approved" | "rejected" | "completed";
  quotedPrice?: number;
  rejectionReason?: string;
  adminNotes?: string;
}