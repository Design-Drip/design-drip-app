import mongoose from "mongoose";

const quantityBySizeSub = new mongoose.Schema({
  size: {
    type: String,
    require: true,
  },
  quantity: {
    type: Number,
    require: true,
  },
});

interface CartModel extends mongoose.Model<CartDoc> {}

interface CartDoc extends mongoose.Document {
  userId: string;
  items: {
    _id?: mongoose.Types.ObjectId;
    designId: mongoose.Types.ObjectId;
    quantityBySize: {
      size: string;
      quantity: number;
      _id?: mongoose.Types.ObjectId;
    }[];
  }[];
}

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    items: [
      {
        designId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Design",
          required: true,
        },
        quantityBySize: {
          type: [quantityBySizeSub],
          default: [],
          required: true,
        },
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

// Create and export the Cart model
const Cart =
  (mongoose.models.Cart as CartModel) ||
  mongoose.model<CartDoc, CartModel>("Cart", cartSchema);

export { Cart };
