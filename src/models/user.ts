import mongoose from "mongoose";
import { Password } from "@/lib/password";

// An interface that describes the properties that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  name?: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "",
    },
  },
  {
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashedPassword = await Password.hashPassword(this.get("password"));
    this.set("password", hashedPassword);
  }
  done();
});

export default mongoose.models.User ||
  mongoose.model<UserDoc>("User", userSchema);
