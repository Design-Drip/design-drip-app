import mongoose from 'mongoose';
// Ensure mongoose is connected before defining models
  
  // Category Schema
  interface CategoryDoc extends mongoose.Document {
    name: string;
    description?: string;
  }
  
  const categorySchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
    },
    {
      toJSON: {
        transform(_, ret) {
          ret.id = ret._id;
          delete ret._id;
          delete ret.__v;
        },
      },
    }
  );
  
  // Shirt Schema
  interface ShirtDoc extends mongoose.Document {
    name: string;
    description?: string;
    default_price: number;
    isActive: boolean;
    categories: mongoose.Types.ObjectId[] | CategoryDoc[];
  }
  
  const shirtSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      default_price: {
        type: Number,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      categories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category',
        },
      ],
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
  
  // ShirtVariant Schema
  interface ShirtVariantDoc extends mongoose.Document {
    shirt_id: mongoose.Types.ObjectId | ShirtDoc;
    size: string;
    color: string;
    additional_price: number;
  }

  const shirtVariantSchema = new mongoose.Schema(
    {
      shirt_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shirt',
        required: true,
      },
      size: {
        type: String,
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
      additional_price: {
        type: Number,
        default: 0,
      },
    },
    {
      toJSON: {
        transform(_, ret) {
          ret.id = ret._id;
          delete ret._id;
          delete ret.__v;
        },
      },
    }
  );
  
  // ShirtImage Schema
  interface ShirtImageDoc extends mongoose.Document {
    shirt_id: mongoose.Types.ObjectId | ShirtDoc;
    is_primary: boolean;
    view_side: string; // Front, Back, Left, Right
    width_editable_zone?: number;
    height_editable_zone?: number;
    url: string;
  }
  
  const shirtImageSchema = new mongoose.Schema(
    {
      shirt_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shirt',
        required: true,
      },
      is_primary: {
        type: Boolean,
        default: false,
      },
      view_side: {
        type: String,
        required: true,
        enum: ['front', 'back', 'left', 'right'], // The 4 sides mentioned in ERD
      },
      width_editable_zone: {
        type: Number,
      },
      height_editable_zone: {
        type: Number,
      },
      url: {
        type: String,
        required: true,
      },
    },
    {
      toJSON: {
        transform(_, ret) {
          ret.id = ret._id;
          delete ret._id;
          delete ret.__v;
        },
      },
    }
  );
  
  // Export models (check if already exists first)
  export const Category = mongoose.models.Category || mongoose.model<CategoryDoc>('Category', categorySchema);
  export const Shirt = mongoose.models.Shirt || mongoose.model<ShirtDoc>('Shirt', shirtSchema);
  export const ShirtVariant = mongoose.models.ShirtVariant || mongoose.model<ShirtVariantDoc>('ShirtVariant', shirtVariantSchema);
  export const ShirtImage = mongoose.models.ShirtImage || mongoose.model<ShirtImageDoc>('ShirtImage', shirtImageSchema);
  
export type { CategoryDoc, ShirtDoc, ShirtVariantDoc, ShirtImageDoc };