import { ShirtDoc } from "@/models/product";
import mongoose from "mongoose";

export type ProductsQueryOptions = {
  sizes?: string[];
  colors?: string[];
  categories?: mongoose.Types.ObjectId[];
  isActive?: boolean;
  name?: mongoose.RootFilterQuery<ShirtDoc>;
  base_price?: mongoose.RootFilterQuery<ShirtDoc>;
  _id?: mongoose.RootFilterQuery<ShirtDoc>;
};

export type ProductsSortOptions = {
  [key: string]: 1 | -1;
};
