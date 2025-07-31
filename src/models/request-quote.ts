import mongoose, { Model } from "mongoose";
import {
    QUOTE_STATUSES,
    ADMIN_RESPONSE_STATUSES,
    REVISION_REASONS,
    REQUESTED_CHANGE_ASPECTS,
    PRINTING_METHODS,
    type QuoteStatus,
    type AdminResponseStatus,
    type RevisionReason,
    type RequestedChangeAspect,
    type PrintingMethod
} from "@/constants/quoteStatus";

const adminResponseVersionSchema = new mongoose.Schema({
    version: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ADMIN_RESPONSE_STATUSES,
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
            enum: PRINTING_METHODS,
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
                enum: REQUESTED_CHANGE_ASPECTS,
            },
            description: {
                type: String,
                trim: true,
            },
        }],
    },

    // ✅ NEW: Admin uploaded images for custom quotes
    adminImages: [{
        type: String,
        trim: true,
        validate: {
            validator: function (value: string) {
                return /^https?:\/\/.+/.test(value);
            },
            message: "Admin image must be a valid URL"
        }
    }],

    isCurrentVersion: {
        type: Boolean,
        default: true,
    },
    revisionReason: {
        type: String,
        enum: REVISION_REASONS,
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
    needDesignService?: boolean,
    designDescription?: string,
    artwork?: string,
    desiredWidth?: number,
    desiredHeight?: number,
    status: QuoteStatus,
    quotedPrice?: number,
    quotedAt?: Date,
    approvedAt?: Date,
    rejectedAt?: Date,
    rejectionReason?: string,
    adminNotes?: string,

    adminResponses: {
        version: number,
        status: AdminResponseStatus,
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
            printingMethod?: PrintingMethod,
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
            requestedChanges?: { aspect: RequestedChangeAspect, description: string }[],
        },
        adminImages?: string[],
        isCurrentVersion?: boolean,
        revisionReason?: RevisionReason,
    }[],

    currentVersion: number,
    totalRevisions: number,

    createdAt: Date,
    updatedAt: Date,
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

        needDesignService: {
            type: Boolean,
            default: false,
        },
        designDescription: {
            type: String,
            trim: true,
            required: function (this: RequestQuoteDoc) {
                return this.needDesignService === true;
            },
            minLength: [10, "Design description must be at least 10 characters"],
        },

        //Artwork and design dimensions
        artwork: {
            type: String,
            trim: true,
            validate: {
                validator: function (value: string) {
                    if (!value) return true;
                    return /^https?:\/\/.+/.test(value);
                },
                message: "Artwork must be a valid URL"
            }
        },
        desiredWidth: {
            type: Number,
            min: [0.5, "Minimum width is 0.5 inches"],
            max: [50, "Maximum width is 50 inches"],
        },
        desiredHeight: {
            type: Number,
            min: [0.5, "Minimum height is 0.5 inches"],
            max: [50, "Maximum height is 50 inches"],
        },

        //Status and tracking
        status: {
            type: String,
            enum: QUOTE_STATUSES,
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

// Compound indexes for better query performance
requestQuoteSchema.index({ userId: 1, status: 1 });
requestQuoteSchema.index({ status: 1, createdAt: -1 });
requestQuoteSchema.index({ type: 1, status: 1 });

// Pre-save middleware to update version numbers
requestQuoteSchema.pre('save', function (next) {
    if (this.isModified('adminResponses')) {
        // Set isCurrentVersion to false for all existing responses
        this.adminResponses.forEach((response: any, index: number) => {
            if (index < this.adminResponses.length - 1) {
                response.isCurrentVersion = false;
            }
        });

        // Update version numbers
        if (this.adminResponses.length > 0) {
            this.currentVersion = this.adminResponses.length;
            this.totalRevisions = this.adminResponses.length - 1;
        }
    }

    next();
});

const RequestQuote =
    (mongoose.models.RequestQuote as Model<RequestQuoteDoc>) ||
    mongoose.model<RequestQuoteDoc>("RequestQuote", requestQuoteSchema);

export type { RequestQuoteDoc };
export { RequestQuote };