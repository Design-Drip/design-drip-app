"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (id) fetchQuote();
  }, [id]);

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
      if (productId) {
        fetchProduct(productId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProduct = async (productId: string) => {
    try {
      setLoadingProduct(true);
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch product");
      setProduct(data.colors);
      console.log("Fetched product:", data);
    } catch (err: any) {
      setProduct(null);
    } finally {
      setLoadingProduct(false);
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
  // Lấy ảnh đầu tiên (hoặc theo view_side: 'front')
  const productImageUrl =
    selectedColor?.images?.find((img: any) => img.view_side === 'front')?.url ||
    selectedColor?.images?.[0]?.url;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quote Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="font-bold text-lg">Customer: {quote.firstName} {quote.lastName}</div>
            <div className="text-muted-foreground text-sm">{quote.emailAddress}</div>
            <div className="mt-2">
              <Badge variant="outline">{quote.type === "product" ? "Product" : "Custom"}</Badge>
              <Badge variant="outline" className="ml-2">Status: {quote.status}</Badge>
            </div>
          </div>
          <div className="mt-4">
            <div className="font-semibold">Product:</div>
            {loadingProduct ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin h-4 w-4" /> Loading product...</div>
            ) : product ? (
              <div className="border rounded p-4 mt-2">
                {productImageUrl ? (
                  <img
                    src={productImageUrl}
                    alt={product.name}
                    className="w-32 h-32 object-contain border rounded mb-2"
                  />
                ) : (
                  <div className="text-muted-foreground">No product image</div>
                )}
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground">Price: {product.default_price ? product.default_price + "₫" : "N/A"}</div>
                {/* Hiển thị thêm thông tin sản phẩm nếu muốn */}
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
                router.push(`/designer_management/editor?productId=${productId}&quoteId=${quote.id}`);
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