"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { ToolSidebarHeader } from "./tool-sidebar-header";

interface UserArtworkSidebarProps {
  quoteId?: string;
  onAddArtwork?: (imageUrl: string) => void;
}

interface QuoteData {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  artwork?: string;
  designDescription?: string;
  desiredWidth?: number;
  desiredHeight?: number;
}

export const UserArtworkSidebar = ({ quoteId, onAddArtwork }: UserArtworkSidebarProps) => {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quoteId) {
      fetchQuoteData();
    }
  }, [quoteId]);

  const fetchQuoteData = async () => {
    if (!quoteId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/request-quotes/${quoteId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch quote data");
      }
      
      setQuoteData(data.data);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to load user artwork");
    } finally {
      setLoading(false);
    }
  };

  const handleAddArtwork = (imageUrl: string) => {
    if (onAddArtwork) {
      onAddArtwork(imageUrl);
      toast.success("Artwork added to canvas");
    }
  };

  if (loading) {
    return (
      <div className="w-80 bg-white border-l p-4">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading user artwork...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 bg-white border-l p-4">
        <div className="text-center text-red-600">
          <p className="font-medium">Error loading artwork</p>
          <p className="text-sm mt-1">{error}</p>
          <Button onClick={fetchQuoteData} variant="outline" className="mt-4" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!quoteData) {
    return (
      <div className="w-80 bg-white border-l p-4">
        <div className="text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">No quote data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l overflow-y-auto">
      <ToolSidebarHeader
        title="User Artwork"
        description="User's artwork"
      />

      <div className="p-4 space-y-4">
        {quoteData.artwork ? (
          <Card className="border-none">
            <CardContent className="p-4">
              <div 
                className="relative group cursor-pointer"
                onClick={() => handleAddArtwork(quoteData.artwork!)}
              >
                <img
                  src={quoteData.artwork}
                  alt="User artwork"
                  className="w-full h-48 object-contain border rounded-lg shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-2 group-hover:border-blue-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-gray-100"
                    >
                      Apply Artwork
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No artwork provided by user</p>
              </div>
            </CardContent>
          </Card>
        )}


        {(quoteData.desiredWidth || quoteData.desiredHeight) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Design Dimensions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {quoteData.desiredWidth && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Width:</span>
                    <span>{quoteData.desiredWidth} inches</span>
                  </div>
                )}
                {quoteData.desiredHeight && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Height:</span>
                    <span>{quoteData.desiredHeight} inches</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        
      </div>
    </div>
  );
}; 