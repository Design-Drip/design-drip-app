import mongoose, { Model } from "mongoose";

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

    status: "pending" | "reviewing" | "quote" | "approved" | "rejected" | "completed",
    quotedPrice?: number,
    quotedAt?: Date,
    approvedAt?: Date,
    rejectedAt?: Date,
    rejectionReason?: string,
    adminNotes?: string,

    createdAt: Date,
    updatedAt: Date,
}

const requestQuoteSchema = new mongoose.Schema<RequestQuoteDoc>(
    {
        //Customer information
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

//Validation: Ensure either productDetails or customRequest is provided based on type
requestQuoteSchema.pre("validate", function (this: RequestQuoteDoc) {
    if (this.type === "product" && !this.productDetails) {
        this.invalidate("productDetails", "Product details are required for product type requests");
    }
    if (this.type === "custom" && !this.customRequest) {
        this.invalidate("customRequest", "Custom request details are required for custom type requests");
    }
});

interface RequestQuoteModel extends Model<RequestQuoteDoc> { }

const RequestQuote =
    (mongoose.models.RequestQuote as RequestQuoteModel) ||
    mongoose.model<RequestQuoteDoc, RequestQuoteModel>("RequestQuote", requestQuoteSchema);

export type { RequestQuoteDoc };
export { RequestQuote };