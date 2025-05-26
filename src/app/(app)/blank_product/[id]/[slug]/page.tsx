"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Heart,
  Share2,
  Plus,
  Minus,
  Star,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { products } from "@/lib/data/products";
import { useRouter } from "next/navigation";

interface ProductDetailPageProps {
  params: {
    id: string;
    slug: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = products.find((p) => p.id === params.id) || products[0];
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(product.colors[0].value);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedView, setSelectedView] = useState("front");
  const [expandedSection, setExpandedSection] = useState<string | null>("description");

  // Mock data for product views
  const productViews = [
    { id: "front", label: "Front", image: product.thumbnail },
    { id: "back", label: "Back", image: "https://www.thetshirtmill.com.au/pcimages/3612173/111274943/1/1/FFFFFF/prod.jpg?b=10951268&v=1742264131&v=1748062992662" },
    { id: "left", label: "Left Sleeve (Short)", image: "https://www.thetshirtmill.com.au/pcimages/2014623/111274943/1/1/FFFFFF/prod.jpg?b=10951268&v=1742264131&v=1748062992662" },
    { id: "right", label: "Right Sleeve (Short)", image: "https://www.thetshirtmill.com.au/pcimages/2014618/111274943/1/1/FFFFFF/prod.jpg?b=10951268&v=1742264131&v=1748062992662" },
  ];

  // Mock data for size guide
  const sizeGuide = [
    { size: "S", width: "47", length: "72.5" },
    { size: "M", width: "52", length: "75.5" },
    { size: "L", width: "57", length: "78.5" },
    { size: "XL", width: "62", length: "81.5" },
    { size: "2XL", width: "67", length: "83.5" },
    { size: "3XL", width: "72", length: "86.5" },
    { size: "4XL", width: "77", length: "87" },
    { size: "5XL", width: "82", length: "88" },
  ];

  // Mock data for reviews
  const reviews = [
    {
      id: 1,
      author: "Gavin Glenn",
      date: "2 days ago",
      platform: "Google",
      rating: 5,
      comment: "Great product, excellent customer service, speedy delivery. Will definitely be ordering more.",
      avatar: "https://ext.same-assets.com/3195487153/145128247.png"
    },
    {
      id: 2,
      author: "Damian Woodward",
      date: "2 days ago",
      platform: "Google",
      rating: 5,
      comment: "Great shirts and customer service!",
      avatar: "https://ext.same-assets.com/3195487153/2989281002.png"
    }
  ];

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => Math.max(1, q - 1));

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  const createNewDesign = () => {
    //Will handle the logic for creating a new design
    router.push(`/designer/${product.id}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-red-600">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/" className="hover:text-red-600">T-Shirts</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images Section */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-4">
              {/* Main Product Image */}
              <div className="relative h-[400px] w-full bg-gray-50 mb-4">
                <Image
                  src={productViews.find(v => v.id === selectedView)?.image || product.thumbnail}
                  alt={`${product.name} - ${selectedView} view`}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Product View Options */}
              <div className="grid grid-cols-4 gap-2">
                {productViews.map((view) => (
                  <div
                    key={view.id}
                    className={`relative cursor-pointer border-2 ${selectedView === view.id ? 'border-red-600' : 'border-gray-200'
                      } rounded overflow-hidden`}
                    onClick={() => setSelectedView(view.id)}
                  >
                    <div className="relative h-24 w-full">
                      <Image
                        src={view.image}
                        alt={view.label}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="text-xs text-center py-1 bg-gray-50">
                      {view.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold mb-4">{product.name}</h1>

              {/* Color Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedColor === color.value ? 'ring-2 ring-red-600 ring-offset-2' : 'border border-gray-200'
                        }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setSelectedColor(color.value)}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <Check className={`h-4 w-4 ${color.value === "#FFFFFF" ? "text-black" : "text-white"}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`px-4 py-2 ${selectedSize === size
                        ? 'bg-red-600 text-white'
                        : 'border border-gray-300 hover:border-gray-400'
                        } rounded-md text-sm font-medium min-w-[50px]`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Quantity</h3>
                <div className="flex items-center">
                  <button
                    onClick={decrementQuantity}
                    className="border border-gray-300 rounded-l-md px-3 py-2 hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="border-t border-b border-gray-300 px-4 py-2 min-w-[60px] text-center">
                    {quantity}
                  </div>
                  <button
                    onClick={incrementQuantity}
                    className="border border-gray-300 rounded-r-md px-3 py-2 hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="ml-3 text-xs text-gray-500">
                    minimum quantity: 1
                  </span>
                </div>
              </div>

              {/* Price and Add to Cart */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-3">
                    <span className="text-xl font-bold text-red-600">
                      ${(product.price.to * quantity).toFixed(2)}
                    </span>
                    <span className="text-xs ml-1">*GST Included</span>
                  </div>
                  {product.price.from !== product.price.to && (
                    <span className="text-sm text-gray-500 line-through">
                      ${(product.price.from * quantity).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div
                    className="flex-1"
                  >
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 h-auto text-base" onClick={() => createNewDesign()}>
                      Start Designing
                    </Button>
                  </div>
                  <Button variant="outline" className="flex items-center justify-center py-3 h-auto">
                    <Heart className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Expandable Sections */}
              <div className="space-y-2 mt-8 border-t border-gray-100 pt-4">
                {/* Description Section */}
                <div className="border border-gray-200 rounded">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => toggleSection('description')}
                  >
                    <h3 className="text-lg font-medium">Description</h3>
                    {expandedSection === 'description' ? (
                      <Minus className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Plus className="h-5 w-5 text-gray-500" />
                    )}
                  </button>

                  {expandedSection === 'description' && (
                    <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
                      <ul className="list-disc list-inside space-y-1 mb-4">
                        <li>Euro fit soft style</li>
                        <li>100% ringspun cotton</li>
                        <li>Fabric weight: 150 GSM</li>
                      </ul>
                      <p className="mb-2">
                        This is an entry level product, great for short term use.
                      </p>
                      <p>
                        Please note the 'Special' tee will vary depending on supplier pricing, in order for us to offer it you at this amazing price we need to buy blanks at an affordable price. This means that sizing will vary +/- 2cm from the sizing provided, and the brand on your shirt may vary between orders.
                      </p>
                    </div>
                  )}
                </div>

                {/* Sizing Details Section */}
                <div className="border border-gray-200 rounded">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => toggleSection('sizing')}
                  >
                    <h3 className="text-lg font-medium">Sizing Details</h3>
                    {expandedSection === 'sizing' ? (
                      <Minus className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Plus className="h-5 w-5 text-gray-500" />
                    )}
                  </button>

                  {expandedSection === 'sizing' && (
                    <div className="px-4 py-3 border-t border-gray-200">
                      <h4 className="font-medium mb-3">Size Guide</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Body Width (cm)</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Body Length (cm)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {sizeGuide.map((size) => (
                              <tr key={size.size} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm">{size.size}</td>
                                <td className="px-4 py-2 text-sm">{size.width}</td>
                                <td className="px-4 py-2 text-sm">{size.length}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shipping Section */}
                <div className="border border-gray-200 rounded">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => toggleSection('shipping')}
                  >
                    <h3 className="text-lg font-medium">Shipping</h3>
                    {expandedSection === 'shipping' ? (
                      <Minus className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Plus className="h-5 w-5 text-gray-500" />
                    )}
                  </button>

                  {expandedSection === 'shipping' && (
                    <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
                      <p className="mb-3">
                        Reminder! All our orders are custom printed just for you right here in Brisbane. To get an ETA on when you can expect your order, add the Production Time and Shipping option you select at the checkout together.
                      </p>
                      <p>
                        <strong>Note:</strong> If you select express shipping but do not select a rush turnaround option, your order will be printed as per our standard turnaround time (7-10 business days)
                      </p>
                    </div>
                  )}
                </div>

                {/* More Images Section */}
                <div className="border border-gray-200 rounded">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => toggleSection('images')}
                  >
                    <h3 className="text-lg font-medium">More Images</h3>
                    {expandedSection === 'images' ? (
                      <Minus className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Plus className="h-5 w-5 text-gray-500" />
                    )}
                  </button>

                  {expandedSection === 'images' && (
                    <div className="px-4 py-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {productViews.map((view) => (
                          <div key={view.id} className="border border-gray-200 rounded overflow-hidden">
                            <div className="relative h-40 w-full">
                              <Image
                                src={view.image}
                                alt={view.label}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Request Quote Button */}
            <div className="mt-4">
              <Button variant="outline" className="w-full py-3 h-auto">
                Request a quote
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold">Reviews</h2>
            <div className="flex ml-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                    <Image
                      src={review.avatar}
                      alt={review.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium">{review.author}</h4>
                      <span className="text-xs text-blue-600 ml-2">✓</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{review.date}</span>
                      <span className="mx-1">on</span>
                      <span className="font-medium">{review.platform}</span>
                    </div>
                  </div>
                </div>

                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= review.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                        }`}
                    />
                  ))}
                </div>

                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
