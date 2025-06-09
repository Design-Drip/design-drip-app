"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/lib/uploadthing";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  ImageIcon,
  Trash2,
  MousePointer,
  RotateCw,
  Image as ImageIconOutline,
  Check,
  Move,
  Square,
  ChevronsUpDown,
  CornerRightDown,
  ZoomIn,
  ZoomOut,
  Hand,
  RefreshCw,
  Info,
  Package,
  Tag,
} from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import {
  uploadProductImages,
  deleteProductImage,
} from "@/app/admin/products/images/_actions";

// Cố định kích thước ảnh
const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 1120;

// Mặc định cho vùng chỉnh sửa
const DEFAULT_EDITABLE_AREA = {
  width: 300,
  height: 300,
  x: 250,
  y: 400,
};

// Các giới hạn zoom
const MIN_ZOOM = 0.5; // 50% zoom
const MAX_ZOOM = 2; // 200% zoom
const ZOOM_STEP = 0.1;

interface EditableArea {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface ProductImage {
  id: string;
  url: string;
  view_side: "front" | "back" | "left" | "right";
  is_primary: boolean;
  editable_area?: EditableArea;
}

interface ImagePosition {
  translateX: number;
  translateY: number;
  zoom: number;
}

interface ProductImageEditorProps {
  productId: string;
  color: {
    id: string;
    name: string;
    value: string;
    images?: ProductImage[];
  };
}

export function ProductImageEditor({
  productId,
  color,
}: ProductImageEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<
    "front" | "back" | "left" | "right"
  >("front");

  // Ref cho container ảnh chính
  const mainImageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // State cho việc kéo thả và zoom
  const [isDragging, setIsDragging] = useState(false);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [dragMode, setDragMode] = useState<
    "move" | "resize-br" | "resize-bl" | "resize-tr" | "resize-tl" | null
  >(null);
  const dragStartRef = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    areaX: 0,
    areaY: 0,
    imageX: 0,
    imageY: 0,
  });

  // State quản lý ảnh
  const [images, setImages] = useState<{
    front?: ProductImage;
    back?: ProductImage;
    left?: ProductImage;
    right?: ProductImage;
  }>({});

  // State cho vị trí và zoom của mỗi ảnh
  const [imagePositions, setImagePositions] = useState<{
    front: ImagePosition;
    back: ImagePosition;
    left: ImagePosition;
    right: ImagePosition;
  }>({
    front: { translateX: 0, translateY: 0, zoom: 1 },
    back: { translateX: 0, translateY: 0, zoom: 1 },
    left: { translateX: 0, translateY: 0, zoom: 1 },
    right: { translateX: 0, translateY: 0, zoom: 1 },
  });

  // State cho editable area
  const [editableArea, setEditableArea] = useState<EditableArea>(
    DEFAULT_EDITABLE_AREA
  );

  // State cho việc đánh dấu ảnh là primary
  const [isPrimary, setIsPrimary] = useState(true);

  // Tỷ lệ scale cho hiển thị canvas
  const [canvasScale, setCanvasScale] = useState(0.5); // Hiển thị ban đầu ở 50%

  // Tooltip guides
  const [showZoomTooltip, setShowZoomTooltip] = useState(false);

  // Initialize images from color data
  useEffect(() => {
    if (color.images) {
      const initialImages: any = {};
      color.images.forEach((img) => {
        initialImages[img.view_side] = img;

        // Nếu ảnh hiện tại là currentView, cập nhật editableArea
        if (img.view_side === currentView) {
          setEditableArea(img.editable_area || DEFAULT_EDITABLE_AREA);
          setIsPrimary(img.is_primary);
        }
      });
      setImages(initialImages);
    }
  }, [color]);

  // Tính toán tỷ lệ scale khi component mounted hoặc kích thước thay đổi
  useEffect(() => {
    const calculateScale = () => {
      if (mainImageContainerRef.current) {
        const containerWidth = mainImageContainerRef.current.clientWidth;
        // Tính toán tỷ lệ hiển thị dựa trên kích thước container
        const calculatedScale = Math.min(0.9, containerWidth / IMAGE_WIDTH);
        setCanvasScale(calculatedScale);
      }
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);

    return () => {
      window.removeEventListener("resize", calculateScale);
    };
  }, []);

  // Cập nhật editableArea khi thay đổi view
  useEffect(() => {
    const currentImage = images[currentView];
    if (currentImage) {
      setEditableArea(currentImage.editable_area || DEFAULT_EDITABLE_AREA);
      setIsPrimary(currentImage.is_primary);
    } else {
      setEditableArea(DEFAULT_EDITABLE_AREA);
      setIsPrimary(currentView === "front");
    }
  }, [currentView, images]);

  // Xử lý wheel event cho zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (
        e.ctrlKey &&
        mainImageContainerRef.current?.contains(e.target as Node)
      ) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        handleZoomChange(delta);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentView, imagePositions]);

  // Hàm xử lý upload ảnh
  const handleImageUpload = async (
    viewSide: "front" | "back" | "left" | "right",
    imageUrl: string
  ) => {
    const isPrimaryView = viewSide === "front";

    setImages((prev) => ({
      ...prev,
      [viewSide]: {
        id: prev[viewSide]?.id || "",
        url: imageUrl,
        view_side: viewSide,
        is_primary: isPrimaryView,
        editable_area: prev[viewSide]?.editable_area || DEFAULT_EDITABLE_AREA,
      },
    }));

    // Reset vị trí và zoom của ảnh mới
    setImagePositions((prev) => ({
      ...prev,
      [viewSide]: { translateX: 0, translateY: 0, zoom: 1 },
    }));

    setCurrentView(viewSide);
    setIsPrimary(isPrimaryView);
    setEditableArea(DEFAULT_EDITABLE_AREA);

    // Hiển thị hướng dẫn zoom
    setShowZoomTooltip(true);
    setTimeout(() => setShowZoomTooltip(false), 5000);

    toast.success(`Image uploaded for ${viewSide} view`);
  };

  // Xử lý thay đổi zoom
  const handleZoomChange = useCallback(
    (delta: number) => {
      setImagePositions((prev) => {
        // Tính toán zoom mới trong phạm vi cho phép
        const newZoom = Math.max(
          MIN_ZOOM,
          Math.min(MAX_ZOOM, prev[currentView].zoom + delta)
        );

        // Hiệu chỉnh translateX và translateY để giữ tâm zoom
        const prevZoom = prev[currentView].zoom;
        const prevTranslateX = prev[currentView].translateX;
        const prevTranslateY = prev[currentView].translateY;

        // Điểm tâm là giữa canvas
        const centerX = IMAGE_WIDTH / 2;
        const centerY = IMAGE_HEIGHT / 2;

        // Điều chỉnh để giữ trọng tâm zoom
        const scaleChange = newZoom / prevZoom;
        const newTranslateX =
          centerX - (centerX - prevTranslateX) * scaleChange;
        const newTranslateY =
          centerY - (centerY - prevTranslateY) * scaleChange;

        // Kiểm tra và giới hạn translateX, translateY
        return {
          ...prev,
          [currentView]: {
            ...prev[currentView],
            zoom: newZoom,
            translateX: newTranslateX,
            translateY: newTranslateY,
          },
        };
      });
    },
    [currentView]
  );

  // Reset vị trí và zoom ảnh
  const resetImagePosition = useCallback(() => {
    setImagePositions((prev) => ({
      ...prev,
      [currentView]: { translateX: 0, translateY: 0, zoom: 1 },
    }));
    toast.info("Image position and zoom level reset");
  }, [currentView]);

  // Xử lý kéo thả ảnh (panning)
  const handleImageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!images[currentView]?.url) return;
    e.preventDefault();
    setIsImageDragging(true);

    dragStartRef.current = {
      ...dragStartRef.current,
      x: e.clientX,
      y: e.clientY,
      imageX: imagePositions[currentView].translateX,
      imageY: imagePositions[currentView].translateY,
    };
  };

  // Xử lý kéo thả vùng chỉnh sửa
  const handleEditableAreaMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    mode: "move" | "resize-br" | "resize-bl" | "resize-tr" | "resize-tl"
  ) => {
    e.preventDefault();
    e.stopPropagation(); // Ngăn không cho sự kiện chạy xuống lớp ảnh phía dưới
    setIsDragging(true);
    setDragMode(mode);

    dragStartRef.current = {
      ...dragStartRef.current,
      x: e.clientX,
      y: e.clientY,
      width: editableArea.width,
      height: editableArea.height,
      areaX: editableArea.x,
      areaY: editableArea.y,
    };
  };

  // Xử lý sự kiện kéo thả trên toàn document
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Xử lý kéo ảnh
      if (isImageDragging) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        // Chuyển đổi delta pixel sang delta thực tế dựa trên zoom và scale
        const actualDeltaX =
          deltaX / (canvasScale * imagePositions[currentView].zoom);
        const actualDeltaY =
          deltaY / (canvasScale * imagePositions[currentView].zoom);

        setImagePositions((prev) => {
          // Tính vị trí mới
          const newTranslateX = dragStartRef.current.imageX + actualDeltaX;
          const newTranslateY = dragStartRef.current.imageY + actualDeltaY;

          // Giới hạn kéo để không vượt quá biên
          const currentZoom = prev[currentView].zoom;
          const maxTranslateX = (IMAGE_WIDTH * (currentZoom - 1)) / 2;
          const maxTranslateY = (IMAGE_HEIGHT * (currentZoom - 1)) / 2;

          return {
            ...prev,
            [currentView]: {
              ...prev[currentView],
              translateX: Math.max(
                -maxTranslateX,
                Math.min(maxTranslateX, newTranslateX)
              ),
              translateY: Math.max(
                -maxTranslateY,
                Math.min(maxTranslateY, newTranslateY)
              ),
            },
          };
        });
      }
      // Xử lý kéo vùng thiết kế
      else if (isDragging && dragMode) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        // Chuyển đổi delta pixel sang delta thực tế trên canvas
        const actualDeltaX = deltaX / canvasScale;
        const actualDeltaY = deltaY / canvasScale;

        let newX = editableArea.x;
        let newY = editableArea.y;
        let newWidth = editableArea.width;
        let newHeight = editableArea.height;

        // Xử lý di chuyển vùng chỉnh sửa
        if (dragMode === "move") {
          newX = Math.max(
            0,
            Math.min(
              IMAGE_WIDTH - editableArea.width,
              dragStartRef.current.areaX + actualDeltaX
            )
          );
          newY = Math.max(
            0,
            Math.min(
              IMAGE_HEIGHT - editableArea.height,
              dragStartRef.current.areaY + actualDeltaY
            )
          );
        }
        // Xử lý resize từ góc dưới phải
        else if (dragMode === "resize-br") {
          newWidth = Math.max(
            50,
            Math.min(
              IMAGE_WIDTH - editableArea.x,
              dragStartRef.current.width + actualDeltaX
            )
          );
          newHeight = Math.max(
            50,
            Math.min(
              IMAGE_HEIGHT - editableArea.y,
              dragStartRef.current.height + actualDeltaY
            )
          );
        }
        // Xử lý resize từ góc dưới trái
        else if (dragMode === "resize-bl") {
          const maxPossibleX =
            dragStartRef.current.areaX + dragStartRef.current.width - 50;
          const newPotentialX = Math.max(
            0,
            Math.min(maxPossibleX, dragStartRef.current.areaX - actualDeltaX)
          );
          newWidth =
            dragStartRef.current.width +
            (dragStartRef.current.areaX - newPotentialX);
          newX = newPotentialX;
          newHeight = Math.max(
            50,
            Math.min(
              IMAGE_HEIGHT - editableArea.y,
              dragStartRef.current.height + actualDeltaY
            )
          );
        }
        // Xử lý resize từ góc trên phải
        else if (dragMode === "resize-tr") {
          newWidth = Math.max(
            50,
            Math.min(
              IMAGE_WIDTH - editableArea.x,
              dragStartRef.current.width + actualDeltaX
            )
          );
          const maxPossibleY =
            dragStartRef.current.areaY + dragStartRef.current.height - 50;
          const newPotentialY = Math.max(
            0,
            Math.min(maxPossibleY, dragStartRef.current.areaY - actualDeltaY)
          );
          newHeight =
            dragStartRef.current.height +
            (dragStartRef.current.areaY - newPotentialY);
          newY = newPotentialY;
        }
        // Xử lý resize từ góc trên trái
        else if (dragMode === "resize-tl") {
          const maxPossibleX =
            dragStartRef.current.areaX + dragStartRef.current.width - 50;
          const newPotentialX = Math.max(
            0,
            Math.min(maxPossibleX, dragStartRef.current.areaX - actualDeltaX)
          );
          newWidth =
            dragStartRef.current.width +
            (dragStartRef.current.areaX - newPotentialX);
          newX = newPotentialX;

          const maxPossibleY =
            dragStartRef.current.areaY + dragStartRef.current.height - 50;
          const newPotentialY = Math.max(
            0,
            Math.min(maxPossibleY, dragStartRef.current.areaY - actualDeltaY)
          );
          newHeight =
            dragStartRef.current.height +
            (dragStartRef.current.areaY - newPotentialY);
          newY = newPotentialY;
        }

        setEditableArea({
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsImageDragging(false);
      setDragMode(null);
    };

    if (isDragging || isImageDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isImageDragging,
    dragMode,
    editableArea,
    currentView,
    canvasScale,
    imagePositions,
  ]);

  // Hàm cập nhật editableArea thông qua input (giá trị thực - không scaled)
  const handleAreaInputChange = (prop: keyof EditableArea, value: number) => {
    const constraints = {
      x: { min: 0, max: IMAGE_WIDTH - editableArea.width },
      y: { min: 0, max: IMAGE_HEIGHT - editableArea.height },
      width: { min: 50, max: IMAGE_WIDTH - editableArea.x },
      height: { min: 50, max: IMAGE_HEIGHT - editableArea.y },
    };

    const newValue = Math.max(
      constraints[prop].min,
      Math.min(constraints[prop].max, value)
    );

    setEditableArea((prev) => ({
      ...prev,
      [prop]: newValue,
    }));
  };

  // Cập nhật trạng thái ảnh và vùng chỉnh sửa cho view hiện tại
  const updateCurrentImage = () => {
    if (!images[currentView]?.url) return;

    setImages((prev) => ({
      ...prev,
      [currentView]: {
        ...prev[currentView]!,
        is_primary: isPrimary,
        editable_area: editableArea,
      },
    }));

    toast.success(`Design area updated for ${currentView} view`);
  };

  // Hàm xử lý thay đổi is_primary
  const handlePrimaryChange = (checked: boolean) => {
    setIsPrimary(checked);

    // Nếu đặt view hiện tại là primary, thì các view khác đều không phải primary
    if (checked) {
      const otherViews = ["front", "back", "left", "right"].filter(
        (view) => view !== currentView
      ) as Array<"front" | "back" | "left" | "right">;

      const newImages = { ...images };
      otherViews.forEach((view) => {
        if (newImages[view]) {
          newImages[view] = {
            ...newImages[view]!,
            is_primary: false,
          };
        }
      });

      setImages(newImages);
    }
  };

  // Lưu tất cả thay đổi
  const handleSaveAllImages = async () => {
    const requiredViews = ["front", "back", "left", "right"];
    const missingViews = requiredViews.filter(
      (view) => !images[view as keyof typeof images]?.url
    );

    if (missingViews.length > 0) {
      toast.error(`Thiếu ảnh cho: ${missingViews.join(", ")}`);
      return;
    }

    // Đảm bảo ít nhất một ảnh là primary
    let hasPrimary = false;
    for (const view of requiredViews) {
      if (images[view as keyof typeof images]?.is_primary) {
        hasPrimary = true;
        break;
      }
    }

    if (!hasPrimary) {
      toast.error(
        "Phải có ít nhất một góc nhìn được đánh dấu là ảnh chính (primary)"
      );
      return;
    }

    toast.info(
      "Ảnh sẽ được lưu với kích thước 800×1120 và vùng thiết kế được scale từ giao diện về đúng tọa độ thật.",
      { duration: 3000 }
    );

    setIsLoading(true);

    try {
      // Chú ý: đảm bảo gửi đầy đủ các giá trị editable zone
      const imagesData = Object.values(images).map((img) => ({
        view_side: img.view_side,
        url: img.url,
        is_primary: img.is_primary,
        // Đảm bảo truyền đúng giá trị chứ không phải tham chiếu
        width_editable_zone:
          img.editable_area?.width || DEFAULT_EDITABLE_AREA.width,
        height_editable_zone:
          img.editable_area?.height || DEFAULT_EDITABLE_AREA.height,
        x_editable_zone: img.editable_area?.x || DEFAULT_EDITABLE_AREA.x,
        y_editable_zone: img.editable_area?.y || DEFAULT_EDITABLE_AREA.y,
      }));

      console.log("Sending image data:", JSON.stringify(imagesData, null, 2));

      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("colorId", color.id);
      formData.append("images", JSON.stringify(imagesData));

      const result = await uploadProductImages(formData);
      if (result.success) {
        toast.success("All images saved successfully");
        router.refresh();
        router.push(`/admin/products/${productId}/variants`);
      } else {
        toast.error(`Error: ${result.message || "Could not save images"}`);
      }
    } catch (error) {
      console.error("Error saving images:", error);
      toast.error("An error occurred while saving images");
    } finally {
      setIsLoading(false);
    }
  };

  // Xoá ảnh hiện tại
  const handleDeleteImage = async () => {
    const imageToDelete = images[currentView];
    if (!imageToDelete?.id) {
      // If the image hasn't been saved, just remove it from state
      setImages((prev) => {
        const newImages = { ...prev };
        delete newImages[currentView];
        return newImages;
      });
      toast.success(`Image deleted for ${currentView} view`);
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("imageId", imageToDelete.id);

      const result = await deleteProductImage(formData);

      if (result.success) {
        setImages((prev) => {
          const newImages = { ...prev };
          delete newImages[currentView];
          return newImages;
        });
        toast.success(`Image deleted for ${currentView} view`);
      } else {
        toast.error(`Could not delete image: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("An error occurred while deleting the image");
    } finally {
      setIsLoading(false);
    }
  };

  // Tính toán cursor style cho vùng ảnh
  const getImageCursorStyle = () => {
    if (!images[currentView]?.url) return "default";

    const zoom = imagePositions[currentView].zoom;
    if (zoom > 1) return isImageDragging ? "grabbing" : "grab";
    return "default";
  };

  return (
    <div className="space-y-6">
      {/* Admin Navigation Bar */}
      <div className="flex items-center justify-between  p-5 rounded-lg ">
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="mr-2">
            <Link href={`/admin/products/${productId}/variants`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Variants
            </Link>
          </Button>
        </div>
      </div>

      {/* Main content - 3 column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (1/3) - Thumbnails and Upload Progress */}
        <div className="space-y-4">
          {/* Thumbnails Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Product Images
              </CardTitle>
              <CardDescription>Images from 4 different views</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {(["front", "back", "left", "right"] as const).map((view) => (
                  <div
                    key={view}
                    className={`relative aspect-[5/7] border rounded overflow-hidden ${
                      currentView === view
                        ? "ring-2 ring-primary"
                        : "hover:ring-1 hover:ring-primary/30"
                    } cursor-pointer transition-all`}
                    onClick={() => setCurrentView(view)}
                  >
                    {images[view]?.url ? (
                      <img
                        src={images[view].url}
                        alt={`${view} view`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 p-2">
                        <ImageIconOutline className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-center text-muted-foreground">
                          No image
                        </span>
                      </div>
                    )}
                    <div className="absolute top-0 left-0 w-full p-1 bg-black bg-opacity-50 text-white text-xs text-center capitalize">
                      {view}
                    </div>
                    {images[view]?.is_primary && (
                      <div className="absolute bottom-0 right-0 bg-green-500 text-white text-[10px] px-1 py-0.5">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upload progress card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Upload Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(["front", "back", "left", "right"] as const).map((view) => (
                  <div key={view} className="flex items-center gap-2">
                    {images[view]?.url ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-amber-500" />
                    )}
                    <span className="text-sm capitalize">{view}</span>
                    <span className="text-xs ml-auto">
                      {images[view]?.url ? (
                        <span className="text-green-600">Uploaded</span>
                      ) : (
                        <span className="text-amber-600">Not uploaded</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="text-xs text-muted-foreground">
                All 4 views must be uploaded before saving
              </div>
            </CardFooter>
          </Card>

          {/* Is Primary Checkbox */}
          {images[currentView]?.url && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPrimary"
                    checked={isPrimary}
                    onCheckedChange={handlePrimaryChange}
                  />
                  <Label
                    htmlFor="isPrimary"
                    className="text-sm cursor-pointer ml-1"
                  >
                    Mark as primary image
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Middle column (1/3) - Canvas View */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>{currentView} view preview</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {IMAGE_WIDTH}×{IMAGE_HEIGHT}px
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative flex items-center justify-center bg-zinc-100 min-h-[70vh]">
              <div
                ref={mainImageContainerRef}
                className="relative w-full h-full flex items-center justify-center p-4"
              >
                <div
                  className="relative"
                  style={{
                    width: `${IMAGE_WIDTH * canvasScale}px`,
                    height: `${IMAGE_HEIGHT * canvasScale}px`,
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                  }}
                  onMouseDown={handleImageMouseDown}
                >
                  {images[currentView]?.url ? (
                    <>
                      {/* Hình ảnh sản phẩm với zoom và pan */}
                      <div
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          cursor: getImageCursorStyle(),
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            transform: `translate(${
                              imagePositions[currentView].translateX *
                              canvasScale
                            }px, ${
                              imagePositions[currentView].translateY *
                              canvasScale
                            }px) scale(${imagePositions[currentView].zoom})`,
                            transformOrigin: "center",
                          }}
                        >
                          <img
                            ref={imageRef}
                            src={images[currentView].url}
                            alt={`Product ${currentView} view`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      {/* Vùng chỉnh sửa */}
                      <div
                        className="absolute border-2 border-blue-600 bg-blue-500/20 hover:border-blue-700 transition-colors duration-200"
                        style={{
                          left: `${editableArea.x * canvasScale}px`,
                          top: `${editableArea.y * canvasScale}px`,
                          width: `${editableArea.width * canvasScale}px`,
                          height: `${editableArea.height * canvasScale}px`,
                          cursor: isDragging ? "grabbing" : "grab",
                          animation: isDragging
                            ? "none"
                            : "pulseHighlight 2s infinite",
                        }}
                        onMouseDown={(e) =>
                          handleEditableAreaMouseDown(e, "move")
                        }
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-xs bg-blue-600/80 text-white px-1.5 py-0.5 rounded pointer-events-none">
                                  <Move className="h-3 w-3 inline mr-1" />
                                  Kéo để di chuyển
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Kéo để di chuyển vùng thiết kế
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Resize handles for corners */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute top-0 left-0 w-4 h-4 bg-blue-600 border border-white cursor-nwse-resize"
                                style={{ transform: "translate(-50%, -50%)" }}
                                onMouseDown={(e) =>
                                  handleEditableAreaMouseDown(e, "resize-tl")
                                }
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              Kéo để thay đổi kích thước
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute top-0 right-0 w-4 h-4 bg-blue-600 border border-white cursor-nesw-resize"
                                style={{ transform: "translate(50%, -50%)" }}
                                onMouseDown={(e) =>
                                  handleEditableAreaMouseDown(e, "resize-tr")
                                }
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              Kéo để thay đổi kích thước
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute bottom-0 left-0 w-4 h-4 bg-blue-600 border border-white cursor-nesw-resize"
                                style={{ transform: "translate(-50%, 50%)" }}
                                onMouseDown={(e) =>
                                  handleEditableAreaMouseDown(e, "resize-bl")
                                }
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              Kéo để thay đổi kích thước
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute bottom-0 right-0 w-4 h-4 bg-blue-600 border border-white cursor-nwse-resize"
                                style={{ transform: "translate(50%, 50%)" }}
                                onMouseDown={(e) =>
                                  handleEditableAreaMouseDown(e, "resize-br")
                                }
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              Kéo để thay đổi kích thước
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <ImageIconOutline className="h-16 w-16 text-muted-foreground opacity-30" />
                      <div className="text-center mt-4">
                        <p className="text-muted-foreground">
                          Chưa có ảnh cho góc nhìn này
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-2 pb-2 px-4 border-t">
              <div className="text-xs text-muted-foreground">
                Current display: {Math.round(canvasScale * 100)}%
              </div>
              {images[currentView]?.url && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handleZoomChange(-ZOOM_STEP)}
                    disabled={imagePositions[currentView].zoom <= MIN_ZOOM}
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <div className="text-xs font-medium min-w-[40px] text-center">
                    {Math.round(imagePositions[currentView].zoom * 100)}%
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handleZoomChange(ZOOM_STEP)}
                    disabled={imagePositions[currentView].zoom >= MAX_ZOOM}
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={resetImagePosition}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Right column (1/3) - Controls for editable area */}
        <div className="lg:col-span-1">
          <Card className="h-auto flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Design Zone
              </CardTitle>
              <CardDescription>
                Set up the customizable area for customers
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              {images[currentView]?.url ? (
                <>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      Design zone for {currentView}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Edit dimensions and position of design zone
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="width">Width (px)</Label>
                      <Input
                        id="width"
                        type="number"
                        min={50}
                        max={IMAGE_WIDTH}
                        value={editableArea.width}
                        onChange={(e) =>
                          handleAreaInputChange(
                            "width",
                            parseInt(e.target.value) || 100
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (px)</Label>
                      <Input
                        id="height"
                        type="number"
                        min={50}
                        max={IMAGE_HEIGHT}
                        value={editableArea.height}
                        onChange={(e) =>
                          handleAreaInputChange(
                            "height",
                            parseInt(e.target.value) || 100
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="x">X Position (px)</Label>
                      <Input
                        id="x"
                        type="number"
                        min={0}
                        max={IMAGE_WIDTH - editableArea.width}
                        value={editableArea.x}
                        onChange={(e) =>
                          handleAreaInputChange(
                            "x",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="y">Y Position (px)</Label>
                      <Input
                        id="y"
                        type="number"
                        min={0}
                        max={IMAGE_HEIGHT - editableArea.height}
                        value={editableArea.y}
                        onChange={(e) =>
                          handleAreaInputChange(
                            "y",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button className="w-full" onClick={updateCurrentImage}>
                      <Check className="mr-2 h-4 w-4" />
                      Update Design Zone
                    </Button>
                  </div>

                  <div className="mt-2 bg-muted/40 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground">
                      <strong>Instruction:</strong> You can drag the design zone
                      directly on the image or enter values in the fields above.
                      Hover over the corners to resize the design zone.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <ImageIconOutline className="h-10 w-10 mb-2 opacity-30" />
                  <p>Please upload an image first</p>
                  <p className="text-xs mt-1">
                    After uploading an image, you can set up the design zone
                  </p>
                </div>
              )}
              {/* Upload Section for Selected View */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Upload {currentView} view
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!images[currentView]?.url ? (
                    <div className="border rounded-lg p-3">
                      <p className="text-xs mb-2 text-muted-foreground">
                        Recommended size: {IMAGE_WIDTH}x{IMAGE_HEIGHT}px
                      </p>
                      <UploadDropzone
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res && res[0]?.url) {
                            handleImageUpload(currentView, res[0].url);
                          }
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`Upload error: ${error.message}`);
                        }}
                        config={{ mode: "auto" }}
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDeleteImage()}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete & re-upload {currentView} image
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="w-full">
                <Button
                  className="w-full"
                  onClick={handleSaveAllImages}
                  disabled={
                    isLoading ||
                    !images.front?.url ||
                    !images.back?.url ||
                    !images.left?.url ||
                    !images.right?.url
                  }
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save All Images"}
                </Button>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Save images with dimensions {IMAGE_WIDTH}x{IMAGE_HEIGHT}px
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* CSS Animation for design zone highlight */}
      <style jsx global>{`
        @keyframes pulseHighlight {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
        }
      `}</style>
    </div>
  );
}
