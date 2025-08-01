"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Palette,
  ArrowRight,
  Shirt,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadDropzone } from "@/lib/uploadthing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  uploadProductImages,
  getProductColors,
} from "@/app/admin/products/images/_actions";

interface ProductImageManagerProps {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ImageUpload {
  viewSide: "front" | "back" | "left" | "right";
  url: string | null;
  width?: number;
  height?: number;
}

interface ProductColor {
  id: string;
  name: string;
  value: string;
}

export function ProductImageManager({
  productId,
  open,
  onOpenChange,
}: ProductImageManagerProps) {
  const router = useRouter();
  const [step, setStep] = useState<"color" | "upload">("color");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [colorValue, setColorValue] = useState<string>("#000000");
  const [availableColors, setAvailableColors] = useState<ProductColor[]>([]);
  const [isNewColor, setIsNewColor] = useState(false);

  const [images, setImages] = useState<Record<string, ImageUpload>>({
    front: { viewSide: "front", url: null },
    back: { viewSide: "back", url: null },
    left: { viewSide: "left", url: null },
    right: { viewSide: "right", url: null },
  });

  // Fetch available colors for this product
  useEffect(() => {
    if (!open || !productId) return;

    const fetchColors = async () => {
      try {
        const colors = await getProductColors(productId);
        setAvailableColors(colors);
      } catch (error) {
        console.error("Error fetching product colors:", error);
        toast.error("Could not load product colors");
      }
    };

    fetchColors();
  }, [productId, open]);

  const handleColorSelect = (value: string) => {
    if (value === "new") {
      setIsNewColor(true);
      setSelectedColor("");
    } else {
      setIsNewColor(false);
      setSelectedColor(value);
      // Find color value from available colors
      const color = availableColors.find((c) => c.id === value);
      if (color) {
        setColorValue(color.value);
      }
    }
  };

  const handleContinue = () => {
    if (isNewColor && !selectedColor.trim()) {
      toast.error("Please enter a color name");
      return;
    }

    setStep("upload");
  };

  const handleImageUpload = (
    viewSide: "front" | "back" | "left" | "right",
    url: string
  ) => {
    setImages((prev) => ({
      ...prev,
      [viewSide]: { ...prev[viewSide], url },
    }));
  };

  const handleEditableDimensions = (
    viewSide: "front" | "back" | "left" | "right",
    key: "width" | "height",
    value: string
  ) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return;

    setImages((prev) => ({
      ...prev,
      [viewSide]: { ...prev[viewSide], [key]: numValue },
    }));
  };

  const handleSaveImages = async () => {
    // Check if all images are uploaded
    const missingImages = Object.values(images).filter((img) => !img.url);
    if (missingImages.length > 0) {
      toast.error(
        `Missing images: ${missingImages.map((img) => img.viewSide).join(", ")}`
      );
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append(
        "colorName",
        isNewColor
          ? selectedColor
          : availableColors.find((c) => c.id === selectedColor)?.name || ""
      );
      formData.append("colorValue", colorValue);
      formData.append("isNewColor", isNewColor.toString());

      if (!isNewColor) {
        formData.append("colorId", selectedColor);
      }

      // Add image data
      Object.values(images).forEach((image) => {
        if (!image.url) return;

        formData.append(`${image.viewSide}Url`, image.url);
        formData.append(
          `${image.viewSide}IsPrimary`,
          (image.viewSide === "front").toString()
        );

        if (image.width) {
          formData.append(`${image.viewSide}Width`, image.width.toString());
        }

        if (image.height) {
          formData.append(`${image.viewSide}Height`, image.height.toString());
        }
      });

      const result = await uploadProductImages(formData);

      if (result.success) {
        toast.success("Product images uploaded successfully!");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(`Failed to upload images: ${result.message}`);
      }
    } catch (error) {
      console.error("Error saving images:", error);
      toast.error("Failed to save product images");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("color");
    setSelectedColor("");
    setColorValue("#000000");
    setImages({
      front: { viewSide: "front", url: null },
      back: { viewSide: "back", url: null },
      left: { viewSide: "left", url: null },
      right: { viewSide: "right", url: null },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Upload Product Images
          </DialogTitle>
          <DialogDescription>
            {step === "color"
              ? "Choose a color for the product images"
              : "Upload images for each view of the product"}
          </DialogDescription>
        </DialogHeader>

        {step === "color" && (
          <>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label>Product Color</Label>
                <Select onValueChange={handleColorSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColors.map((color) => (
                      <SelectItem key={color.id} value={color.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: color.value }}
                          />
                          <span>{color.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="new">+ Add new color</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isNewColor && (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="colorName">Color Name</Label>
                    <Input
                      id="colorName"
                      placeholder="e.g., Navy Blue"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="colorValue">Color Value</Label>
                    <div className="flex gap-2 items-center">
                      <div
                        className="h-9 w-9 rounded-md border"
                        style={{ backgroundColor: colorValue }}
                      />
                      <Input
                        id="colorValue"
                        type="color"
                        value={colorValue}
                        onChange={(e) => setColorValue(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleContinue}
                disabled={
                  (!isNewColor && !selectedColor) ||
                  (isNewColor && !selectedColor.trim())
                }
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "upload" && (
          <>
            <div className="flex items-center gap-4 mb-4">
              <Palette className="h-5 w-5" />
              <div className="flex items-center gap-2">
                <span className="font-medium">Selected Color:</span>
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: colorValue }}
                />
                <span>
                  {isNewColor
                    ? selectedColor
                    : availableColors.find((c) => c.id === selectedColor)
                        ?.name || "Unknown"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {(["front", "back", "left", "right"] as const).map((side) => (
                <Card
                  key={side}
                  className={side === "front" ? "border-primary" : ""}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shirt className="h-4 w-4" />
                        {side.charAt(0).toUpperCase() + side.slice(1)} View
                      </div>
                      {side === "front" && (
                        <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md">
                          Primary
                        </div>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {side === "front"
                        ? "This is the main image shown in product listings"
                        : `Upload image for the ${side} view`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!images[side].url ? (
                      <div className="min-h-[160px] flex items-center justify-center">
                        <UploadDropzone
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            if (res && res[0]?.ufsUrl) {
                              handleImageUpload(side, res[0].ufsUrl);
                              toast.success(`${side} image uploaded`);
                            }
                          }}
                          onUploadError={(error: Error) => {
                            toast.error(`Upload failed: ${error.message}`);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-md overflow-hidden border aspect-square">
                          <img
                            src={images[side].url}
                            alt={`${side} view`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleImageUpload(side, null as any)}
                          className="w-full"
                        >
                          Replace Image
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor={`${side}-width`}>Width (px)</Label>
                        <Input
                          id={`${side}-width`}
                          type="number"
                          placeholder="Width"
                          value={images[side].width || ""}
                          onChange={(e) =>
                            handleEditableDimensions(
                              side,
                              "width",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${side}-height`}>Height (px)</Label>
                        <Input
                          id={`${side}-height`}
                          type="number"
                          placeholder="Height"
                          value={images[side].height || ""}
                          onChange={(e) =>
                            handleEditableDimensions(
                              side,
                              "height",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="text-xs text-muted-foreground">
                      {images[side].url ? (
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3" /> Image uploaded
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500">
                          <AlertCircle className="h-3 w-3" /> Image required
                        </span>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <DialogFooter className="gap-2 flex-wrap">
              <Button variant="outline" onClick={() => setStep("color")}>
                Back to Color Selection
              </Button>
              <Button
                onClick={handleSaveImages}
                disabled={
                  isLoading || !Object.values(images).every((img) => img.url)
                }
              >
                {isLoading ? "Saving..." : "Save All Images"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
