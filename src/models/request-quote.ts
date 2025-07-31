import mongoose, { Model } from "mongoose";

const adminResponseVersionSchema = new mongoose.Schema({
    version: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["reviewing", "quoted", "revised", "approved", "rejected"],
        required: true,
    },
    quotedPrice: {
        type: Number,
        min: 0,
    },
    responseMessage: {
        type: String,
        trim: true,
    },
    rejectionReason: {
        type: String,
        trim: true,
    },
    adminNotes: {
        type: String,
        trim: true,
    },

    priceBreakdown: {
        basePrice: {
            type: Number,
            min: 0,
        },
        setupFee: {
            type: Number,
            min: 0,
            default: 0,
        },
        designFee: {
            type: Number,
            min: 0,
            default: 0,
        },
        rushFee: {
            type: Number,
            min: 0,
            default: 0,
        },
        shippingCost: {
            type: Number,
            min: 0,
            default: 0,
        },
        tax: {
            type: Number,
            min: 0,
            default: 0,
        },
        totalPrice: {
            type: Number,
            required: function(this: any): boolean {
                return this.status === "quoted" || this.status === "revised";
            },
            min: 0,
        },
    },
    
    productionDetails: {
        estimatedDays: {
            type: Number,
            min: 1,
        },
        printingMethod: {
            type: String,
            enum: ["DTG", "DTF", "Screen Print", "Vinyl", "Embroidery"],
        },
        materialSpecs: {
            type: String,
            trim: true,
        },
        colorLimitations: {
            type: String,
            trim: true,
        },
        sizeAvailability: [{
            size: String,
            available: Boolean,
        }],
    },
    
    respondedBy: {
        type: String,
        ref: "Users",
        required: true,
    },
    respondedAt: {
        type: Date,
        default: Date.now,
    },
    validUntil: {
        type: Date,
    },
    customerViewed: {
        type: Boolean,
        default: false,
    },
    customerViewedAt: {
        type: Date,
    },
    
    customerFeedback: {
        requestedChanges: [{
            aspect: {
                type: String,
                enum: ["price", "timeline", "materials", "design", "other"],
            },
            description: {
                type: String,
                trim: true,
            },
        }],
    },
    
    isCurrentVersion: {
        type: Boolean,
        default: true,
    },
    revisionReason: {
        type: String,
        enum: ["customer_request", "admin_improvement", "cost_change", "timeline_change", "material_change"],
    },
}, { timestamps: true, _id: true });

const productDetailsSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shirt",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    selectedColorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ShirtColor",
    },
    quantityBySize: [{
        size: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
    }]
}, { _id: false });

const customRequestSchema = new mongoose.Schema({
    customNeed: {
        type: String,
        required: true,
        trim: true,
        minLength: 5,
    },
}, { _id: false });

interface RequestQuoteDoc extends mongoose.Document {
    userId: string,
    firstName: string,
    lastName: string,
    emailAddress: string,
    phone: string,
    company?: string,
    streetAddress: string,
    suburbCity: string,
    country: string,
    state: string,
    postcode: string,
    agreeTerms: boolean,

    type: "product" | "custom";
    productDetails?: {
        productId: mongoose.Types.ObjectId,
        quantity: number,
        selectedColorId?: mongoose.Types.ObjectId,
        quantityBySize?: {
            size: string,
            quantity: number,
        }[],
    },
    customRequest?: {
        customNeed: string,
    },

    needDeliveryBy?: Date,
    extraInformation?: string,

    status: "pending" | "reviewing" | "quoted" | "approved" | "rejected" | "completed",
    quotedPrice?: number,
    quotedAt?: Date,
    approvedAt?: Date,
    rejectedAt?: Date,
    rejectionReason?: string,
    adminNotes?: string,

    // ✅ NEW: Versioned admin responses
    adminResponses: {
        version: number,
        status: string,
        quotedPrice?: number,
        responseMessage?: string,
        rejectionReason?: string,
        adminNotes?: string,
        priceBreakdown?: {
            basePrice?: number,
            setupFee?: number,
            designFee?: number,
            rushFee?: number,
            shippingCost?: number,
            tax?: number,
            totalPrice?: number,
        },
        productionDetails?: {
            estimatedDays?: number,
            printingMethod?: string,
            materialSpecs?: string,
            colorLimitations?: string,
            sizeAvailability?: { size: string, available: boolean }[],
        },
        respondedBy: string,
        respondedAt: Date,
        validUntil?: Date,
        customerViewed?: boolean,
        customerViewedAt?: Date,
        customerFeedback?: {
            rating?: number,
            comments?: string,
            requestedChanges?: { aspect: string, description: string }[],
        },
        isCurrentVersion?: boolean,
        revisionReason?: string,
    }[],

    // ✅ NEW: Version tracking
    currentVersion: number,
    totalRevisions: number,

    createdAt: Date,
    updatedAt: Date,
    designerId?: string,
    design_id?: mongoose.Types.ObjectId, // Reference to primary design for this quote
}

const requestQuoteSchema = new mongoose.Schema<RequestQuoteDoc>(
    {
        //Customer information
        userId: {
            type: String,
            ref: "Users",
            required: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        emailAddress: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        company: {
            type: String,
            trim: true,
        },
        streetAddress: {
            type: String,
            required: true,
        },
        suburbCity: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        postcode: {
            type: String,
            required: true,
        },
        agreeTerms: {
            type: Boolean,
            required: true,
            validate: {
                validator: (value: boolean) => value === true,
                message: "Terms and conditions must be agreed to",
            },
        },

        //Request type and details
        type: {
            type: String,
            required: true,
            enum: ["product", "custom"]
        },
        productDetails: {
            type: productDetailsSchema,
            required: function (this: RequestQuoteDoc) {
                return this.type === "product"
            },
        },
        customRequest: {
            type: customRequestSchema,
            required: function (this: RequestQuoteDoc) {
                return this.type === "custom"
            }
        },

        //Delivery and additional information
        needDeliveryBy: {
            type: Date,
        },
        extraInformation: {
            type: String,
            trim: true,
        },

        //Status and tracking
        status: {
            type: String,
            enum: ["pending", "reviewing", "quoted", "approved", "rejected", "completed"],
            default: "pending",
            index: true,
        },
        quotedPrice: {
            type: Number,
            min: 0,
        },
        quotedAt: {
            type: Date,
        },
        approvedAt: {
            type: Date,
        },
        rejectedAt: {
            type: Date,
        },
        rejectionReason: {
            type: String,
            trim: true,
        },
        adminNotes: {
            type: String,
            trim: true,
        },

        //Designer assignment
        designerId: {
            type: String,
            ref: "Users", // hoặc "Designers" nếu có collection riêng
            default: null,
        },

        // ✅ NEW: Primary design for this quote
        design_id: {
            type: mongoose.Types.ObjectId,
            ref: "Design",
            default: null,
        },

        // ✅ NEW: Versioned admin responses array
        adminResponses: [adminResponseVersionSchema],

        // ✅ NEW: Version tracking
        currentVersion: {
            type: Number,
            default: 0,
        },
        totalRevisions: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_, ret) {
                ret.id = ret._id,
                    delete ret._id,
                    delete ret.__v
            },
        },
    }
);

//Indexes for better query performance
requestQuoteSchema.index({ emailAddress: 1 }),
    requestQuoteSchema.index({ status: 1, createAt: -1 }),
    requestQuoteSchema.index({ createdAt: -1 }),
    requestQuoteSchema.index({ type: 1 })
    // ✅ NEW: Additional indexes for admin responses
    requestQuoteSchema.index({ currentVersion: 1 }),
    requestQuoteSchema.index({ "adminResponses.isCurrentVersion": 1 }),
    requestQuoteSchema.index({ "adminResponses.respondedBy": 1 }),
    requestQuoteSchema.index({ designerId: 1 }),

//Validation: Ensure either productDetails or customRequest is provided based on type
requestQuoteSchema.pre("validate", function (this: RequestQuoteDoc) {
    if (this.type === "product" && !this.productDetails) {
        this.invalidate("productDetails", "Product details are required for product type requests");
    }
    if (this.type === "custom" && !this.customRequest) {
        this.invalidate("customRequest", "Custom request details are required for custom type requests");
    }
});

// ✅ NEW: Pre-save middleware for version tracking
requestQuoteSchema.pre("save", function (this: RequestQuoteDoc) {
    // Update legacy fields from current response version for backward compatibility
    if (this.adminResponses && this.adminResponses.length > 0) {
        const currentResponse = this.adminResponses.find(r => r.isCurrentVersion);
        if (currentResponse) {
            this.status = currentResponse.status as any;
            this.quotedPrice = currentResponse.quotedPrice;
            this.quotedAt = currentResponse.respondedAt;
            this.adminNotes = currentResponse.adminNotes;
            this.rejectionReason = currentResponse.rejectionReason;
        }
    }

    // Update revision count
    this.totalRevisions = Math.max(0, this.adminResponses.length - 1);
});

// ✅ NEW: Static methods for version management
interface RequestQuoteModel extends Model<RequestQuoteDoc> {
    addAdminResponse(quoteId: string, responseData: any, adminId: string, isRevision?: boolean): Promise<RequestQuoteDoc>;
    getCurrentResponse(quoteId: string): Promise<any>;
    getResponseHistory(quoteId: string): Promise<any[]>;
}

// Add admin response with versioning
requestQuoteSchema.statics.addAdminResponse = function(
    quoteId: string,
    responseData: any,
    adminId: string,
    isRevision: boolean = false
) {
    return this.findById(quoteId).then((quote: RequestQuoteDoc) => {
        if (!quote) throw new Error("Quote not found");

        // Mark all previous responses as not current
        quote.adminResponses.forEach(response => {
            response.isCurrentVersion = false;
        });

        // Create new version
        const newVersion = quote.currentVersion + 1;
        const newResponse = {
            version: newVersion,
            ...responseData,
            respondedBy: adminId,
            respondedAt: new Date(),
            isCurrentVersion: true,
            revisionReason: isRevision ? responseData.revisionReason : undefined,
        };

        quote.adminResponses.push(newResponse);
        quote.currentVersion = newVersion;
        
        if (isRevision) {
            quote.totalRevisions += 1;
        }

        return quote.save();
    });
};

// Get current active response
requestQuoteSchema.statics.getCurrentResponse = function(quoteId: string) {
    return this.findById(quoteId).then((quote: RequestQuoteDoc) => {
        if (!quote) return null;
        return quote.adminResponses.find(r => r.isCurrentVersion);
    });
};

// Get full response history
requestQuoteSchema.statics.getResponseHistory = function(quoteId: string) {
    return this.findById(quoteId).then((quote: RequestQuoteDoc) => {
        if (!quote) return [];
        return quote.adminResponses.sort((a, b) => a.version - b.version);
    });
};

const RequestQuote =
    (mongoose.models.RequestQuote as RequestQuoteModel) ||
    mongoose.model<RequestQuoteDoc, RequestQuoteModel>("RequestQuote", requestQuoteSchema);

export type { RequestQuoteDoc };
export { RequestQuote };