import mongoose, { Model } from "mongoose";
import {
    QUOTE_STATUSES,
    PRINTING_METHODS,
    type QuoteStatus,
    type PrintingMethod
} from "@/constants/quoteStatus";

interface RequestQuoteDoc extends mongoose.Document {
    userId: string;
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

    productDetails?: {
        productId: mongoose.Types.ObjectId;
        quantity: number;
        selectedColorId?: mongoose.Types.ObjectId;
        quantityBySize?: { size: string; quantity: number, additional_price: number }[];
    };

    needDeliveryBy?: Date;
    extraInformation?: string;
    designDescription?: string;
    artwork?: string;
    desiredWidth?: number;
    desiredHeight?: number;

    status: QuoteStatus;
    quotedPrice?: number;
    quotedAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string;
    adminNotes?: string;
    responseMessage?: string;

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

    designerId?: string;
    design_id?: mongoose.Types.ObjectId, // Reference to primary design for this quote
    designStatus?: string;

    validUntil?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}

const requestQuoteSchema = new mongoose.Schema<RequestQuoteDoc>(
    {
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
        productDetails: {
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
                size: String,
                quantity: Number,
                additional_price: Number
            }],
        },

        needDeliveryBy: {
            type: Date,
        },
        extraInformation: {
            type: String,
            trim: true,
        },

        designDescription: {
            type: String,
            trim: true,
            minLength: [10, "Design description must be at least 10 characters"],
        },
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
        responseMessage: {
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
        },

        //Designer assignment
        designerId: {
            type: String,
            ref: "Users", // hoặc "Designers" nếu có collection riêng
            default: null,
        },

        design_id: {
            type: mongoose.Types.ObjectId,
            ref: "Design",
            default: null,
        },

        designStatus: {
            type: String,
            default: 'pending',
        },

        validUntil: {
            type: Date,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

const RequestQuote =
    (mongoose.models.RequestQuote as Model<RequestQuoteDoc>) ||
    mongoose.model<RequestQuoteDoc>("RequestQuote", requestQuoteSchema);

export type { RequestQuoteDoc };
export { RequestQuote };