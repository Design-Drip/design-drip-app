"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Save, Download, Share, Settings, Layers, Type, Image as ImageIcon, Plus } from "lucide-react";
import { Editor } from "@/components/editor/Editor";
import SavedDesigns from "@/components/saved-designs/SavedDesigns";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import React from "react";

export default function DesignEditorPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("editor");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // Check URL params for saved designs
  const urlParams = new URLSearchParams(window.location.search);
  const showSaved = urlParams.get('saved') === 'true';
  
  // Set initial tab based on URL params
  useEffect(() => {
    if (showSaved) {
      setActiveTab("saved");
    }
  }, [showSaved]);

  // Mock product data for designer
  const mockProducts = [
    {
      id: "1",
      name: "Basic T-Shirt",
      colors: [
        {
          id: "color1",
          name: "White",
          images: [
            {
              id: "img1",
              url: "/shirt-placeholder.webp",
              view_side: "Front",
              x_editable_zone: 50,
              y_editable_zone: 50,
              width_editable_zone: 300,
              height_editable_zone: 200,
            },
            {
              id: "img2", 
              url: "/shirt-placeholder.webp",
              view_side: "Back",
              x_editable_zone: 50,
              y_editable_zone: 50,
              width_editable_zone: 300,
              height_editable_zone: 200,
            }
          ]
        },
        {
          id: "color2",
          name: "Black",
          images: [
            {
              id: "img3",
              url: "/shirt-placeholder.webp", 
              view_side: "Front",
              x_editable_zone: 50,
              y_editable_zone: 50,
              width_editable_zone: 300,
              height_editable_zone: 200,
            }
          ]
        }
      ]
    }
  ];

  const handleProductSelect = (product: any, color: any) => {
    setSelectedProduct({
      ...product,
      selectedColor: color
    });
    setActiveTab("editor");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design Editor</h1>
          <p className="text-muted-foreground">
            Create and edit your designs with powerful tools.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Design Editor</TabsTrigger>
          <TabsTrigger value="saved">Saved Designs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          {!selectedProduct ? (
            <Card>
              <CardHeader>
                <CardTitle>Select a Product to Start Designing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockProducts.map((product) => (
                    <div key={product.id} className="space-y-4">
                      <h3 className="font-medium">{product.name}</h3>
                      <div className="grid gap-2">
                        {product.colors.map((color) => (
                          <Card 
                            key={color.id} 
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleProductSelect(product, color)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-12 h-12 rounded border"
                                  style={{ backgroundColor: color.name.toLowerCase() }}
                                ></div>
                                <div>
                                  <p className="font-medium">{color.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {color.images.length} views
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-[calc(100vh-300px)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedProduct(null)}
                  >
                    ← Back to Products
                  </Button>
                  <div>
                    <h3 className="font-medium">{selectedProduct.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct.selectedColor.name}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
              <Editor
                images={selectedProduct.selectedColor.images}
                productColorId={selectedProduct.selectedColor.id}
                designDetail={undefined}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Saved Designs</CardTitle>
            </CardHeader>
            <CardContent>
              <SavedDesigns displayActionMenu={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Design Templates</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Mock templates */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <Palette className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium">Summer Collection</h3>
                    <p className="text-sm text-muted-foreground">Seasonal designs</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <Palette className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium">Corporate Branding</h3>
                    <p className="text-sm text-muted-foreground">Business designs</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <Palette className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium">Holiday Special</h3>
                    <p className="text-sm text-muted-foreground">Event designs</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 