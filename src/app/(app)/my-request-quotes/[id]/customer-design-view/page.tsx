"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Eye, 
  Download,
  Loader2,
  XCircle,
  Palette,
  User,
  Package,
  Calendar,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { formatOrderDateTime, formatOrderDate } from "@/lib/date";
import { useUser } from "@clerk/nextjs";

interface QuoteData {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  company?: string;
  status: string;
  designStatus: string;
  createdAt: string;
  design_id?: string;
  quotedPrice?: number;
  productDetails: {
    productId: any;
    selectedColorId: any;
    quantity: number;
  };
  designDescription?: string;
  extraInformation?: string;
}

interface DesignData {
  id: string;
  name: string;
  version: number;
  design_images: Record<string, string>;
  createdAt: string;
  shirt_color_id: {
    color: string;
    hex_code: string;
    shirt_id: {
      name: string;
    };
  };
}

export default function CustomerDesignViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [design, setDesign] = useState<DesignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageView, setSelectedImageView] = useState<string>("front");

  useEffect(() => {
    if (id && user?.id) {
      fetchQuoteAndDesign();
    }
  }, [id, user?.id]);

  const fetchQuoteAndDesign = async () => {
    try {
      setLoading(true);
      
      // Fetch quote details
      const quoteRes = await fetch(`/api/request-quotes/${id}`);
      const quoteData = await quoteRes.json();
      
      if (!quoteRes.ok) {
        throw new Error(quoteData.message || "Failed to fetch quote");
      }
      
      // Check if this quote belongs to the current user
      if (quoteData.data.userId !== user?.id) {
        throw new Error("You don't have permission to view this quote");
      }
      
      setQuote(quoteData.data);
      
      // Fetch design if design_id exists
      if (quoteData.data.design_id) {
        const designRes = await fetch(`/api/design/${quoteData.data.design_id}`);
        const designData = await designRes.json();
        
        if (designRes.ok && designData.success) {
          setDesign(designData.data);
        }
      } else {
        setError("Design is not ready yet. Please check back later.");
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDesign = (imageUrl: string, viewSide: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `design_${viewSide}_view.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">Loading your design...</p>
          <p className="text-muted-foreground">Please wait while we fetch your custom design</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-semibold mb-2">Unable to Load Design</h3>
              <p className="text-muted-foreground mb-4">
                {error || "Quote not found"}
              </p>
              <Button variant="outline" asChild>
                <Link href="/profile">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to My Quotes
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/profile" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to My Quotes
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Custom Design</h1>
                <p className="text-muted-foreground">
                  Design for Quote #{quote.id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Design Completed
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Design Preview - Main Area */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Your Custom Design Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {design && design.design_images ? (
                  <div className="space-y-6">
                    {/* Image View Selector */}
                    <div className="flex gap-2 flex-wrap justify-center">
                      {Object.keys(design.design_images).map((viewSide) => (
                        <Button
                          key={viewSide}
                          variant={selectedImageView === viewSide ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedImageView(viewSide)}
                          className="capitalize"
                        >
                          {viewSide} View
                        </Button>
                      ))}
                    </div>

                    {/* Main Design Image */}
                    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 flex items-center justify-center min-h-[500px]">
                      {design.design_images[selectedImageView] ? (
                        <div className="relative group">
                          <img
                            src={design.design_images[selectedImageView]}
                            alt={`Your design - ${selectedImageView} view`}
                            className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg transition-transform group-hover:scale-105"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDownloadDesign(design.design_images[selectedImageView], selectedImageView)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <Eye className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No image available for {selectedImageView} view</p>
                        </div>
                      )}
                    </div>

                    {/* Design Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm font-medium text-blue-900">Design Name</p>
                        <p className="text-lg font-semibold text-blue-700">{design.name}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-blue-900">Version</p>
                        <p className="text-lg font-semibold text-blue-700">v{design.version}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-blue-900">Completed</p>
                        <p className="text-lg font-semibold text-blue-700">{formatOrderDate(design.createdAt)}</p>
                      </div>
                    </div>

                    {/* Product Info */}
                    {design.shirt_color_id && (
                      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                        <h4 className="font-semibold mb-4 text-gray-900">Product Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium text-gray-700">Product:</span>
                            <p className="text-gray-600">{design.shirt_color_id.shirt_id?.name || "Custom T-Shirt"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Color:</span>
                            <div className="flex items-center gap-2 mt-1">
                              <div 
                                className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: design.shirt_color_id.hex_code }}
                              />
                              <span className="text-gray-600">{design.shirt_color_id.color}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Download All Button */}
                    <div className="flex justify-center">
                      <Button 
                        size="lg" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          Object.entries(design.design_images).forEach(([viewSide, imageUrl]) => {
                            setTimeout(() => handleDownloadDesign(imageUrl, viewSide), 200);
                          });
                        }}
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Download All Views
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-16">
                    <Palette className="h-20 w-20 mx-auto mb-6 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">Design Not Ready</h3>
                    <p className="text-lg mb-4">Our designers are still working on your custom design.</p>
                    <p className="text-sm">You'll receive an email notification when it's ready for preview.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quote Information - Sidebar */}
          <div className="space-y-6">
            {/* Quote Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Quote Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quote ID</p>
                  <p className="text-lg font-semibold">#{quote.id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    {quote.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Quantity</p>
                  <p className="text-lg font-semibold">{quote.productDetails.quantity} pcs</p>
                </div>
                {quote.quotedPrice && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quoted Price</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${quote.quotedPrice.toFixed(2)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-600">Request Date</p>
                  <p className="text-sm text-gray-500">{formatOrderDate(quote.createdAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-gray-900">{quote.firstName} {quote.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">{quote.emailAddress}</p>
                </div>
                {quote.company && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Company</p>
                    <p className="text-gray-900">{quote.company}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Design Requirements */}
            {quote.designDescription && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Your Design Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {quote.designDescription}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            {quote.extraInformation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Additional Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {quote.extraInformation}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-green-700 space-y-2">
                <p>✅ Your custom design is ready!</p>
                <p>✅ You can download all design views</p>
                <p>📧 Check your email for order details</p>
                <p>💬 Contact us if you need any modifications</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}