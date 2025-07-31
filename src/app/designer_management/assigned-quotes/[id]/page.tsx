"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DesignerQuoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [hasFetchedProduct, setHasFetchedProduct] = useState(false);
  const isFetchingProduct = useRef(false);

  useEffect(() => {
    if (id) {
      setHasFetchedProduct(false);
      isFetchingProduct.current = false;
      fetchQuote();
    }
  }, [id]);

  // Debug effect to track product state changes
  useEffect(() => {
    if (product) {
      console.log("Product state updated:", product);
    }
  }, [product]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/request-quotes/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch quote");
      setQuote(data.data);
      // Lấy productId đúng kiểu string
      let productIdRaw = data.data?.productDetails?.productId;
      let productId = typeof productIdRaw === "string"
        ? productIdRaw
        : productIdRaw?._id || productIdRaw?.id;
      if (productId && !hasFetchedProduct && !isFetchingProduct.current) {
        fetchProduct(productId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProduct = async (productId: string) => {
    if (isFetchingProduct.current) {
      return;
    }
    
    try {
      isFetchingProduct.current = true;
      setLoadingProduct(true);
      setHasFetchedProduct(true);
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch product");
      setProduct(data);
    } catch (err: any) {
      console.error("Product fetch error:", err);
      setProduct(null);
    } finally {
      setLoadingProduct(false);
      isFetchingProduct.current = false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="font-medium">Error loading quote</p>
              <p className="text-sm mt-1">{error}</p>
              <Button onClick={fetchQuote} variant="outline" className="mt-4">Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex items-center justify-center h-64">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">Quote not found</h3>
      </div>
    );
  }

  // Lấy selectedColorId từ quote
  const selectedColorId = quote.productDetails?.selectedColorId?.toString?.() || quote.productDetails?.selectedColorId;
  
  // Tìm color object trong product.colors
  const selectedColor = product?.colors?.find((c: any) => c.id === selectedColorId);
  
  // Lấy tất cả ảnh của color được chọn hoặc color đầu tiên
  const colorToUse = selectedColor || product?.colors?.[0];
  const productImages = colorToUse?.images || [];

  return (
    <div className="container space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quote Detail</h1>
          <p className="text-muted-foreground">
            Manage request quote detail
          </p>
        </div>
      </div>
      <Card>

        <CardContent className="space-y-4 py-6">
          <div>
            <div className="font-bold text-lg">Customer: {quote.firstName} {quote.lastName}</div>
            <div className="text-muted-foreground text-sm">{quote.emailAddress}</div>
            <div className="mt-2">
              <Badge variant="outline">{quote.type === "product" ? "Product" : "Custom"}</Badge>
              <Badge variant="outline" className="ml-2">Status: {quote.status}</Badge>
            </div>
          </div>
          <div className="mt-4">
            {loadingProduct && !product ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin h-4 w-4" /> Loading product...</div>
            ) : product ? (
              <div className="border rounded p-4 mt-2">
                <div className="font-medium">{product.product?.name || "Product"}</div>
                {/* <div className="text-sm text-muted-foreground">Price: {product.product?.base_price ? product.product.base_price + "₫" : "N/A"}</div> */}
                {colorToUse && (
                  <div className="text-sm text-muted-foreground">Color: {colorToUse.color}</div>
                )}
                {!selectedColor && selectedColorId && (
                  <div className="text-sm text-red-500">Selected color not found (ID: {selectedColorId}), showing first available color</div>
                )}
                {(!product.colors || product.colors.length === 0) && (
                  <div className="text-sm text-red-500">No colors available for this product</div>
                )}
                
                {/* Hiển thị tất cả 4 ảnh của 4 mặt áo */}
                {productImages.length > 0 ? (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-3">Product Images:</div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {productImages.map((image: any, index: number) => (
                        <div key={image.id || index} className="flex flex-col items-center flex-shrink-0">
                          <img
                            src={image.url}
                            alt={`${product.product?.name || "Product"} - ${image.view_side}`}
                            className="w-20 h-20 object-contain border rounded-lg shadow-sm"
                          />
                          <div className="text-xs text-muted-foreground mt-1 font-medium capitalize">
                            {image.view_side}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground mt-4">No product images available</div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">No product info</div>
            )}
          </div>
          <div className="mt-6">
            <Button
              onClick={() => {
                let productIdRaw = quote.productDetails?.productId;
                let productId = typeof productIdRaw === "string"
                  ? productIdRaw
                  : productIdRaw?._id || productIdRaw?.id;
                let selectedColorId = quote.productDetails?.selectedColorId?.toString?.() || quote.productDetails?.selectedColorId;
                // Navigate directly to designer editor
                router.push(`/designer_management/designer-editor/${productId}?colorId=${selectedColorId}&quoteId=${quote.id}&fromQuote=true`);
              }}
              disabled={!product}
            >
              Start Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 