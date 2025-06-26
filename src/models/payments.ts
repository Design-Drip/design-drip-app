import mongoose, { Model } from "mongoose";

const paymentsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
      unique: true,
    },
    stripeObject: {
      type: Object,
      required: true,
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

interface PaymentsModel extends Model<PaymentsDoc> {}

interface PaymentsDoc extends mongoose.Document {
  userId: string;
  stripeId: string;
  stripeObject: any;
  createdAt: Date;
  updatedAt: Date;
}

const Payments =
  (mongoose.models.Payments as PaymentsModel) ||
  mongoose.model<PaymentsDoc, PaymentsModel>("Payments", paymentsSchema);

export { Payments };
