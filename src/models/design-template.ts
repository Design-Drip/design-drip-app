import mongoose, { Model } from "mongoose";

interface DesignTemplateDoc extends mongoose.Document {
    name: string;
    imageUrl: string;
    category: string;
    isActive: boolean;
    featured: boolean;
    rating: number;
    totalRatings: number;
}

const designTemplateSchema = new mongoose.Schema<DesignTemplateDoc>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 255,
        },
        imageUrl: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            enum: [
                "logo",
                "banner",
                "poster",
                "business-card",
                "flyer",
                "social-media",
                "brochure",
                "presentation",
                "invitation",
                "certificate"
            ],
            default: "logo",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        totalRatings: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Indexes for better query performance
designTemplateSchema.index({ category: 1, is_active: 1 });
designTemplateSchema.index({ featured: 1, is_active: 1 });
designTemplateSchema.index({ createdAt: -1 }); // For newest first
designTemplateSchema.index({ rating: -1 }); // For highest rated

const DesignTemplate =
    (mongoose.models.DesignTemplate as Model<DesignTemplateDoc>) ||
    mongoose.model<DesignTemplateDoc>("DesignTemplate", designTemplateSchema);

export type { DesignTemplateDoc };
export { DesignTemplate };