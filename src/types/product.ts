export interface ProductCategory {
  id: string;
  name: string;
  description: string;
}

export interface ProductSize {
  id: string;
  size: string;
  additional_price: number;
}

export interface ProductImage {
  id: string;
  view_side: "front" | "back" | "left" | "right";
  url: string;
  is_primary: boolean;
  width: number;
  height: number;
  width_editable_zone: number;
  height_editable_zone: number;
  x_editable_zone: number;
  y_editable_zone: number;
}

export interface ProductColor {
  id: string;
  color: string;
  color_value: string;
  images: ProductImage[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  isActive: boolean;
  categories: ProductCategory[];
}

export interface ProductDetailResponse {
  product: Product;
  sizes: ProductSize[];
  colors: ProductColor[];
}
