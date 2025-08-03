import { OrderAddress } from "@/types/address";
import mongoose, { Model } from "mongoose";

const orderItemSizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  pricePerUnit: {
    type: Number,
    required: true,
  },
});

const orderItemSchema = new mongoose.Schema({
  designId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Design",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  sizes: [orderItemSizeSchema],
  totalPrice: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "canceled"],
      default: "pending",
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    shipping: {
      name: {
        type: String,
        required: true,
      },
      phone: String,
      address: {
        city: String,
        line1: String,
        line2: String,
        state: String,
        country: String,
        postal_code: String,
      },
      method: {
        type: String,
        enum: ["standard", "express"],
        default: "standard",
      },
      cost: {
        type: Number,
        default: 0,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentMethodDetails: {
      type: Object,
    },
    paymentFailureReason: {
      type: String,
    },
    refundedAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
    },
    partiallyRefunded: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
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

interface OrderDoc extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  stripePaymentIntentId: string;
  status:
    | "pending"
    | "processing"
    | "shipping"
    | "shipped"
    | "delivered"
    | "canceled";
  items: {
    designId: {
      _id: mongoose.Types.ObjectId;
      shirt_color_id?: {
        shirt_id?: {
          id: mongoose.Types.ObjectId;
          name: string;
        };
      } | null;
    } | null;
    name: string;
    color: string;
    sizes: {
      size: string;
      quantity: number;
      pricePerUnit: number;
    }[];
    totalPrice: number;
    imageUrl?: string;
  }[];
  totalAmount: number;
  shipping?: OrderAddress & {
    method?: "standard" | "express";
    cost?: number;
  };
  paymentMethod: string;
  paymentMethodDetails?: any;
  paymentFailureReason?: string;
  refundedAt?: Date;
  refundAmount?: number;
  partiallyRefunded?: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderModel extends Model<OrderDoc> {}

const Order =
  (mongoose.models.Order as OrderModel) ||
  mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
