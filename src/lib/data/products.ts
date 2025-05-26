export type Product = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  price: {
    from: number;
    to: number;
  };
  colors: {
    name: string;
    value: string;
  }[];
  sizes: string[];
  category: string;
  printingMethod: string;
  width: number;
  height: number;
  json: string;
};
export const products: Product[] = [
  {
    id: "32623278",
    name: "Mens Special Tee",
    slug: "Mens-Special-Tee",
    thumbnail: "https://ext.same-assets.com/577065618/2146407386.jpeg",
    price: {
      from: 19.95,
      to: 19.95,
    },
    colors: [
      { name: "White", value: "#FFFFFF" },
      { name: "Black", value: "#000000" },
      { name: "Grey", value: "#808080" },
      { name: "Red", value: "#FF0000" },
      { name: "Blue", value: "#0000FF" },
    ],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    category: "Mens",
    printingMethod: "DTF Printing",

    width: 500,
    height: 500,
    json: JSON.stringify({
      objects: [
        {
          type: "image",
          version: "5.3.0",
          originX: "left",
          originY: "top",
          left: 100,
          top: 100,
          width: 500,
          height: 600,
          fill: "rgb(0,0,0)",
          stroke: null,
          strokeWidth: 0,
          strokeDashArray: null,
          strokeLineCap: "butt",
          strokeDashOffset: 0,
          strokeLineJoin: "miter",
          strokeUniform: false,
          strokeMiterLimit: 4,
          scaleX: 1.5,
          scaleY: 1.5,
          angle: 0,
          flipX: false,
          flipY: false,
          opacity: 1,
          shadow: null,
          visible: true,
          backgroundColor: "",
          fillRule: "nonzero",
          paintFirst: "fill",
          globalCompositeOperation: "source-over",
          skewX: 0,
          skewY: 0,
          cropX: 0,
          cropY: 0,
          selectable: true,
          hasControls: true,
          src: "https://images.unsplash.com/photo-1518950957614-73ac0a001408?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MjE5OTh8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTk0MzM0Nzl8&ixlib=rb-4.0.3&q=80&w=1080",
          crossOrigin: "anonymous",
          filters: []
        },
      ],
      background: "#ffffff",
    })
  },
  {
    id: "32623363",
    name: "Ladies Special Tee",
    slug: "Ladies-Special-Tee",
    thumbnail: "https://ext.same-assets.com/577065618/64249794.jpeg",
    price: {
      from: 19.95,
      to: 19.95,
    },
    colors: [
      { name: "White", value: "#FFFFFF" },
      { name: "Black", value: "#000000" },
      { name: "Pink", value: "#FFC0CB" },
      { name: "Purple", value: "#800080" },
      { name: "Grey", value: "#808080" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    category: "Ladies",
    printingMethod: "DTF Printing",

    width: 1100,
    height: 1500,
    json: JSON.stringify({
      objects: [],
      background: "#FFFFFF"
    })
  },
  {
    id: "45222577",
    name: "Kids Special Tee",
    slug: "Kids-Special-Tee",
    thumbnail: "https://ext.same-assets.com/577065618/1385926942.jpeg",
    price: {
      from: 19.95,
      to: 19.95,
    },
    colors: [
      { name: "White", value: "#FFFFFF" },
      { name: "Black", value: "#000000" },
      { name: "Red", value: "#FF0000" },
      { name: "Blue", value: "#0000FF" },
      { name: "Yellow", value: "#FFFF00" },
    ],
    sizes: ["3XS", "XXS", "XS", "S", "M", "L", "XL"],
    category: "Youth and Baby",
    printingMethod: "DTF Printing",

    width: 900,
    height: 1200,
    json: JSON.stringify({
      objects: [],
      background: "#FFFFFF"
    })
  },
  {
    id: "50231297",
    name: "AS Colour - Staple Tee",
    slug: "AS-Colour-Staple-Tee",
    thumbnail: "https://ext.same-assets.com/577065618/2821843994.jpeg",
    price: {
      from: 29.95,
      to: 22.46,
    },
    colors: [
      { name: "White", value: "#FFFFFF" },
      { name: "Black", value: "#000000" },
      { name: "Grey", value: "#808080" },
      { name: "Navy", value: "#000080" },
      { name: "Green", value: "#008000" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    category: "Mens",
    printingMethod: "DTF Printing",

    width: 1200,
    height: 1600,
    json: JSON.stringify({
      objects: [
        {
          type: "image",
          version: "5.3.0",
          originX: "left",
          originY: "top",
          left: -156.32,
          top: -290.5,
          width: 1080,
          height: 614,
          fill: "rgb(0,0,0)",
          stroke: null,
          strokeWidth: 0,
          strokeDashArray: null,
          strokeLineCap: "butt",
          strokeDashOffset: 0,
          strokeLineJoin: "miter",
          strokeUniform: false,
          strokeMiterLimit: 4,
          scaleX: 1.7,
          scaleY: 1.95,
          angle: 0,
          flipX: false,
          flipY: false,
          opacity: 1,
          shadow: null,
          visible: true,
          backgroundColor: "",
          fillRule: "nonzero",
          paintFirst: "fill",
          globalCompositeOperation: "source-over",
          skewX: 0,
          skewY: 0,
          cropX: 0,
          cropY: 0,
          selectable: true,
          hasControls: true,
          src: "https://images.unsplash.com/photo-1518950957614-73ac0a001408?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MjE5OTh8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTk0MzM0Nzl8&ixlib=rb-4.0.3&q=80&w=1080",
          crossOrigin: "anonymous",
          filters: []
        },
      ],
      background: "#FFFFFF"
    })
  },
  {
    id: "54963752",
    name: "AS Colour - Maple Tee",
    slug: "AS-Colour-Maple-Tee",
    thumbnail: "https://ext.same-assets.com/577065618/1220823463.jpeg",
    price: {
      from: 29.95,
      to: 22.46,
    },
    colors: [
      { name: "White", value: "#FFFFFF" },
      { name: "Black", value: "#000000" },
      { name: "Red", value: "#FF0000" },
      { name: "Pink", value: "#FFC0CB" },
      { name: "Blue", value: "#0000FF" },
      { name: "Green", value: "#008000" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    category: "Ladies",
    printingMethod: "DTF Printing",

    width: 1100,
    height: 1500,
    json: JSON.stringify({
      objects: [],
      background: "#FFFFFF"
    })
  },
  {
    id: "94445302",
    name: "Stedman Classic Tee",
    slug: "Stedman-Classic-Tee",
    thumbnail: "https://ext.same-assets.com/577065618/3527529801.jpeg",
    price: {
      from: 26.95,
      to: 20.21,
    },
    colors: [
      { name: "White", value: "#FFFFFF" },
      { name: "Black", value: "#000000" },
      { name: "Grey", value: "#808080" },
      { name: "Red", value: "#FF0000" },
      { name: "Blue", value: "#0000FF" },
    ],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    category: "Mens",
    printingMethod: "DTF Printing",

    width: 1200,
    height: 1600,
    json: JSON.stringify({
      objects: [],
      background: "#FFFFFF"
    })
  },
  {
    id: "94615692",
    name: "Stedman Ladies Classic Tee",
    slug: "Stedman-Ladies-Classic-Tee",
    thumbnail: "https://ext.same-assets.com/577065618/2033473870.jpeg",
    price: {
      from: 26.95,
      to: 20.21,
    },
    colors: [
      { name: "White", value: "#FFFFFF" },
      { name: "Black", value: "#000000" },
      { name: "Pink", value: "#FFC0CB" },
      { name: "Red", value: "#FF0000" },
      { name: "Blue", value: "#0000FF" },
    ],
    sizes: ["S (8)", "M (10)", "L (12)", "XL (14)", "2XL (16)", "3XL (18)"],
    category: "Ladies",
    printingMethod: "DTF Printing",

    width: 1100,
    height: 1500,
    json: JSON.stringify({
      objects: [],
      background: "#FFFFFF"
    })
  },
  {
    id: "94615702",
    name: "Stedman Junior Classic Tee",
    slug: "Stedman-Junior-Classic-Tee",
    thumbnail: "https://ext.same-assets.com/577065618/771982382.jpeg",
    price: {
      from: 26.95,
      to: 20.21,
    },
    colors: [
      { name: "White", value: "#FFFFFF" },
      { name: "Black", value: "#000000" },
      { name: "Red", value: "#FF0000" },
      { name: "Blue", value: "#0000FF" },
      { name: "Yellow", value: "#FFFF00" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "Youth and Baby",
    printingMethod: "DTF Printing",

    width: 900,
    height: 1200,
    json: JSON.stringify({
      objects: [],
      background: "#FFFFFF"
    })
  },
  {
    id: "9179937",
    name: "Sportage - Surf Tee",
    slug: "Sportage-Surf-Tee",
    thumbnail: "https://ext.same-assets.com/577065618/1451118686.jpeg",
    price: {
      from: 29.95,
      to: 22.46,
    },
    colors: [
      { name: "White", value: "#FFFFFF" },
      { name: "Black", value: "#000000" },
      { name: "Red", value: "#FF0000" },
      { name: "Blue", value: "#0000FF" },
      { name: "Yellow", value: "#FFFF00" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    category: "Mens",
    printingMethod: "DTF Printing",

    width: 1200,
    height: 1600,
    json: JSON.stringify({
      objects: [],
      background: "#FFFFFF"
    })
  },
  {
    id: "249699446",
    name: "JB's Tee",
    slug: "JB-s-Tee",
    thumbnail: "https://ext.same-assets.com/577065618/3828149726.jpeg",
    price: {
      from: 29.95,
      to: 22.46,
    },
    colors: [
      { name: "White", value: "#FFFFFF" },
      { name: "Black", value: "#000000" },
      { name: "Grey", value: "#808080" },
      { name: "Red", value: "#FF0000" },
      { name: "Blue", value: "#0000FF" },
    ],
    sizes: ["3XS", "2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6/7XL", "8/9XL", "10/11XL", "12/13XL"],
    category: "Mens",
    printingMethod: "DTF Printing",

    width: 1200,
    height: 1600,
    json: JSON.stringify({
      objects: [],
      background: "#FFFFFF"
    })
  },
  {
    id: "249699451",
    name: "JB's Ladies Tee",
    slug: "JB-s-Ladies-Tee",
    thumbnail: "https://ext.same-assets.com/577065618/1446257056.jpeg",
    price: {
      from: 29.95,
      to: 22.46,
    },
    colors: [
      { name: "White", value: "#FFFFFF" },
      { name: "Black", value: "#000000" },
      { name: "Pink", value: "#FFC0CB" },
      { name: "Red", value: "#FF0000" },
      { name: "Blue", value: "#0000FF" },
    ],
    sizes: ["8", "10", "12", "14", "16", "18", "20", "22", "24"],
    category: "Ladies",
    printingMethod: "DTF Printing",

    width: 1100,
    height: 1500,
    json: JSON.stringify({
      objects: [],
      background: "#FFFFFF"
    })
  },
  {
    id: "253887041",
    name: "JB's Kids Tee",
    slug: "JB-s-Kids-Tee",
    thumbnail: "https://ext.same-assets.com/577065618/2865518894.jpeg",
    price: {
      from: 29.95,
      to: 22.46,
    },
    colors: [
      { name: "White", value: "#FFFFFF" },
      { name: "Black", value: "#000000" },
      { name: "Red", value: "#FF0000" },
      { name: "Blue", value: "#0000FF" },
      { name: "Yellow", value: "#FFFF00" },
    ],
    sizes: ["2", "4", "6", "8", "10", "12", "14"],
    category: "Youth and Baby",
    printingMethod: "DTF Printing",

    width: 900,
    height: 1200,
    json: JSON.stringify({
      objects: [],
      background: "#FFFFFF"
    })
  },
];

export const categories = [
  { name: "Mens", count: 300 },
  { name: "Ladies", count: 238 },
  { name: "Youth and Baby", count: 79 },
  { name: "Search by Brand", count: 652 },
  { name: "Hospitality", count: 77 },
  { name: "Active & Sport", count: 101 },
  { name: "Headwear", count: 111 },
  { name: "Bags", count: 36 },
  { name: "Workwear & High Vis", count: 44 },
  { name: "Corporate", count: 68 },
  { name: "Homewares", count: 37 },
  { name: "Bring Your Own", count: 20 },
  { name: "Apparel", count: 10 },
];

export const colorCategories = [
  { name: "Whites, Blacks & Greys", count: 712 },
  { name: "Beige", count: 192 },
  { name: "Pink", count: 172 },
  { name: "Red", count: 233 },
  { name: "Orange", count: 133 },
  { name: "Green", count: 255 },
  { name: "Blue", count: 457 },
  { name: "Brown", count: 129 },
  { name: "Purple", count: 99 },
  { name: "Yellow", count: 126 },
  { name: "Blue-Green", count: 96 },
  { name: "Patterns", count: 41 },
];
