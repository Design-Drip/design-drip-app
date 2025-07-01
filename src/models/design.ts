import mongoose, { Model } from "mongoose";

interface ElementDesign {
  images_id: mongoose.Types.ObjectId;
  element_Json: string;
}

interface DesignDoc extends mongoose.Document {
  user_id: string;
  shirt_color_id: mongoose.Types.ObjectId;
  element_design: { [key: string]: ElementDesign }; // Store multiple image designs
  name: string; // Add design name to the interface
  design_images: Record<string, string>; // Store design images as a map
  parent_design_id?: mongoose.Types.ObjectId; // Reference to parent design for versioning
  version: string; // Version identifier: "original", "v1", "v2", etc.
}
const designSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      trim: true,
    },
    shirt_color_id: {
      type: mongoose.Types.ObjectId,
      ref: "ShirtColor",
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: "Shirt Design", // Default name
    },
    parent_design_id: {
      type: mongoose.Types.ObjectId,
      ref: "Design",
      required: false, // Optional - null for original designs
    },
    version: {
      type: String,
      required: true,
      default: "original", // Default version for new designs
    },
    design_images: {
      type: Map,
      of: String,
      default: {},
    },
    element_design: {
      type: Map,
      of: {
        images_id: {
          type: mongoose.Types.ObjectId,
          required: true,
        },
        element_Json: {
          type: String, // Store the canvas JSON as string
          required: true,
        },
      },
      default: new Map(),
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const Design =
  (mongoose.models.Design as Model<DesignDoc>) ||
  mongoose.model<DesignDoc>("Design", designSchema);

export type { DesignDoc };
export { Design };
