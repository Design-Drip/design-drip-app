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
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: "Shirt Design", // Default name
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
