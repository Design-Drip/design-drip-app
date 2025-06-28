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
    shippingDetails: {
      name: String,
      address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentMethodDetails: {
      type: Object,
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
  userId: string;
  stripePaymentIntentId: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "canceled";
  items: {
    designId: mongoose.Types.ObjectId;
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
  shippingDetails?: {
    name?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  paymentMethod: string;
  paymentMethodDetails?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderModel extends Model<OrderDoc> {}

const Order =
  (mongoose.models.Order as OrderModel) ||
  mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
