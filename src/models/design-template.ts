import mongoose, { Model } from "mongoose";

interface DesignTemplateDoc extends mongoose.Document {
    title: string;
    description?: string;
    imageUrl: string; // URL của hình ảnh template
    category: string;
    is_active: boolean;
    created_by: mongoose.Types.ObjectId;
    downloads: number;
    featured: boolean;
    rating: number;
    total_ratings: number;
}

const designTemplateSchema = new mongoose.Schema<DesignTemplateDoc>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 255,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000,
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
        is_active: {
            type: Boolean,
            default: true,
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        downloads: {
            type: Number,
            default: 0,
            min: 0,
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
        total_ratings: {
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
designTemplateSchema.index({ tags: 1, is_active: 1 });
designTemplateSchema.index({ featured: 1, is_active: 1 });
designTemplateSchema.index({ created_by: 1 });
designTemplateSchema.index({ downloads: -1 }); // For popular templates
designTemplateSchema.index({ createdAt: -1 }); // For newest first
designTemplateSchema.index({ rating: -1 }); // For highest rated

const DesignTemplate =
    (mongoose.models.DesignTemplate as Model<DesignTemplateDoc>) ||
    mongoose.model<DesignTemplateDoc>("DesignTemplate", designTemplateSchema);

export type { DesignTemplateDoc };
export { DesignTemplate };