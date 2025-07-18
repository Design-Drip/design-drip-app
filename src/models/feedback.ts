import mongoose from "mongoose";

export interface FeedbackDoc extends mongoose.Document {
  orderId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
}

const feedbackSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
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

const Feedback =
  (mongoose.models.Feedback as mongoose.Model<FeedbackDoc>) ||
  mongoose.model<FeedbackDoc>("Feedback", feedbackSchema);

export { Feedback };
