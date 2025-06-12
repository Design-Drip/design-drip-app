import mongoose, { Model } from "mongoose";

//
// 1. Category Schema (tuỳ chọn, dùng để phân loại sản phẩm)
//
interface CategoryDoc extends mongoose.Document {
  name: string;
  description?: string;
}

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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

const Category =
  (mongoose.models.Category as Model<CategoryDoc>) ||
  mongoose.model<CategoryDoc>("Category", categorySchema);

export type { CategoryDoc };

//
// 2. Shirt (Product) Schema
//
interface ShirtDoc extends mongoose.Document {
  name: string;
  description?: string;
  base_price: number;
  isActive: boolean;
  categories: mongoose.Types.ObjectId[];
}

const shirtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    base_price: {
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
        ref: "Category",
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

const Shirt =
  (mongoose.models.Shirt as Model<ShirtDoc>) ||
  mongoose.model<ShirtDoc>("Shirt", shirtSchema);

export type { ShirtDoc };

//
// 3. Subdocument cho Ảnh (ImageSubdoc)
//

// Cập nhật interface với đầy đủ các trường bắt buộc
interface ImageSubdoc extends mongoose.Document {
  view_side: "front" | "back" | "left" | "right";
  url: string;
  is_primary: boolean;
  width: number; // Chiều rộng của ảnh
  height: number; // Chiều cao của ảnh
  width_editable_zone: number;
  height_editable_zone: number;
  x_editable_zone: number;
  y_editable_zone: number;
}

// Cập nhật schema với đầy đủ các trường và giá trị mặc định
const imageSubSchema = new mongoose.Schema<ImageSubdoc>(
  {
    view_side: {
      type: String,
      required: true,
      enum: ["front", "back", "left", "right"],
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    is_primary: {
      type: Boolean,
      default: false,
    },
    width: {
      type: Number,
      default: 800, // Kích thước cố định
      required: true,
    },
    height: {
      type: Number,
      default: 1120, // Kích thước cố định
      required: true,
    },
    width_editable_zone: {
      type: Number,
      default: 300,
      required: true,
    },
    height_editable_zone: {
      type: Number,
      default: 300,
      required: true,
    },
    x_editable_zone: {
      type: Number,
      default: 250,
      required: true,
    },
    y_editable_zone: {
      type: Number,
      default: 400,
      required: true,
    },
  },
  {
    _id: true,
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

//
// 4. ShirtColor Schema (mỗi màu + 4 ảnh)
//

interface ShirtColorDoc extends mongoose.Document {
  shirt_id: mongoose.Types.ObjectId;
  color: string;
  color_value?: string;
  images: ImageSubdoc[];
}

const shirtColorSchema = new mongoose.Schema<ShirtColorDoc>(
  {
    shirt_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shirt",
      required: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    color_value: {
      type: String,
      trim: true,
      default: "#000000",
    },
    images: {
      type: [imageSubSchema],
      default: [],
      validate: {
        validator: function (arr: ImageSubdoc[]) {
          // Cho phép mảng rỗng hoặc đủ 4 ảnh với đúng view_side
          if (arr.length === 0) return true;
          if (arr.length !== 4) return false;

          // Kiểm tra có đủ 4 view_side khác nhau không
          const sides = arr.map((img) => img.view_side);
          return (
            sides.includes("front") &&
            sides.includes("back") &&
            sides.includes("left") &&
            sides.includes("right") &&
            // Đảm bảo không có view_side trùng nhau
            new Set(sides).size === 4
          );
        },
        message:
          "Mỗi color variant phải có 0 ảnh hoặc đủ 4 ảnh với view_side khác nhau: front/back/left/right.",
      },
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

// Đảm bảo mỗi Shirt chỉ có một document ShirtColor cho mỗi màu
shirtColorSchema.index({ shirt_id: 1, color: 1 }, { unique: true });

const ShirtColor =
  (mongoose.models.ShirtColor as Model<ShirtColorDoc>) ||
  mongoose.model<ShirtColorDoc>("ShirtColor", shirtColorSchema);

export type { ShirtColorDoc };

//
// 5. ShirtSizeVariant Schema (size + giá cộng thêm + kho, tham chiếu đến ShirtColor)
//
interface ShirtSizeVariantDoc extends mongoose.Document {
  shirtColor: mongoose.Types.ObjectId;
  size: string;
  additional_price: number;
}

const shirtSizeVariantSchema = new mongoose.Schema<ShirtSizeVariantDoc>(
  {
    shirtColor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShirtColor",
      required: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    additional_price: {
      type: Number,
      default: 0,
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

// Đảm bảo mỗi ShirtColor chỉ có một document SizeVariant cho mỗi size
shirtSizeVariantSchema.index({ shirtColor: 1, size: 1 }, { unique: true });

const ShirtSizeVariant =
  (mongoose.models.ShirtSizeVariant as Model<ShirtSizeVariantDoc>) ||
  mongoose.model<ShirtSizeVariantDoc>(
    "ShirtSizeVariant",
    shirtSizeVariantSchema
  );

export type { ShirtSizeVariantDoc };

//
// 6. Export tất cả models
//
export { Category, Shirt, ShirtColor, ShirtSizeVariant };
