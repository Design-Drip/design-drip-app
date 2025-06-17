"use client";
import { useEditor } from "@/features/editor/hooks/use-editor";
import {
  ActiveTool,
  JSON_KEYS,
  selectionDependentTools,
} from "@/features/editor/types";
import { Product } from "@/lib/data/products";
import { fabric } from "fabric";
import debounce from "lodash.debounce";
import Image from "next/image";
import React, { use, useCallback, useEffect, useRef, useState } from "react";
import { Navbar } from "./components/navbar";
import { Sidebar } from "./components/sidebar";
import { Toolbar } from "./components/toolbar";
import { Footer } from "./components/footer";
import { TextSidebar } from "./components/text-sidebar";
import { AiSidebar } from "./components/ai-sidebar";
import { SettingsSidebar } from "./components/settings-sidebar";
import { FontSidebar } from "./components/font-sidebar";
import { ImageSidebar } from "./components/image-sidebar";
import { Shirt } from "@/models/product";
import { useCreateDesign } from "@/features/design/use-create-design";
import { toast } from "sonner";

interface EditorProps {
  initialData: Product;
  productWhite: any;
}

export const Editor = ({ initialData, productWhite }: EditorProps) => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const images = productWhite?.images || [];
  const [selectedImage, setSelectedImage] = useState<any>(images[0] || {});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Store canvas states for each image
  const [canvasStates, setCanvasStates] = useState<{ [key: number]: string }>(
    {}
  );

  //mutation
  const createDesignMutation = useCreateDesign();

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const { init, editor } = useEditor({
    defaultState: initialData.json,
    defaultWidth: selectedImage.editable_area?.width,
    defaultHeight: selectedImage.editable_area?.height,
    clearSelectionCallback: onClearSelection,
  });

  // Add debounced save to database function
  const debouncedSaveToDatabase = useCallback(
    debounce(async (canvasStatesData: { [key: number]: string }) => {
      try {
        // Transform canvasStates to match the API schema
        const elementDesign: { [key: string]: any } = {};
        Object.entries(canvasStatesData).forEach(([imageIndex, canvasJson]) => {
          const image = images[parseInt(imageIndex)];
          if (image && image.id) {
            elementDesign[imageIndex] = {
              images_id: image.id,
              element_Json: canvasJson,
            };
          }
        });

        // Only save if there's design data
        if (Object.keys(elementDesign).length > 0) {
          const result = createDesignMutation.mutate(
            {
              shirt_color_id: productWhite.id,
              element_design: elementDesign,
            },
            {
              onSuccess: () => {
                toast.success("Design saved successfully!");
              },
              onError: (error) => {
                toast.error("Failed to save design.");
              },
            }
          );
        }
      } catch (error) {
        toast.error("Failed to save design.");
      }
    }, 3000), // Save after 3 seconds of inactivity
    [initialData.id, images, createDesignMutation]
  );

  // Save current canvas state before switching
  const saveCurrentCanvasState = useCallback(() => {
    if (editor?.canvas) {
      const canvasJson = editor.canvas.toJSON();
      const timestamp = new Date().toISOString();

      const newCanvasStates = {
        ...canvasStates,
        [selectedImageIndex]: JSON.stringify({
          canvas: canvasJson,
          metadata: {
            lastModified: timestamp,
            objectCount: editor.canvas.getObjects().length,
            canvasDimensions: {
              width: selectedImage.editable_area?.width,
              height: selectedImage.editable_area?.height,
            },
          },
        }),
      };

      setCanvasStates(newCanvasStates);

      // Save to database with debouncing
      debouncedSaveToDatabase(newCanvasStates);
    }
  }, [
    editor,
    selectedImageIndex,
    selectedImage,
    canvasStates,
    debouncedSaveToDatabase,
  ]);

  // Load canvas state for selected image
  const loadCanvasState = useCallback(
    (imageIndex: number) => {
      if (editor?.canvas && canvasStates[imageIndex]) {
        try {
          const savedState = JSON.parse(canvasStates[imageIndex]);
          const canvasData = savedState.canvas || savedState; // Backward compatibility

          editor.canvas.loadFromJSON(canvasData, () => {
            editor.canvas.renderAll();
          });
        } catch (error) {
          console.error("Error loading canvas state:", error);
          editor.canvas.clear();
        }
      } else if (editor?.canvas) {
        editor.canvas.clear();
      }
    },
    [editor, canvasStates]
  );

  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (tool === "draw") {
        editor?.enableDrawingMode();
      }

      if (activeTool === "draw") {
        editor?.disableDrawingMode();
      }

      if (tool === activeTool) {
        return setActiveTool("select");
      }

      setActiveTool(tool);
    },
    [activeTool, editor]
  );

  const canvasRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current!,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);
  // Handle image selection
  const handleImageSelect = useCallback(
    (image: any, index: number) => {
      // Save current canvas state before switching
      saveCurrentCanvasState();

      // Update selected image
      setSelectedImage(image);
      setSelectedImageIndex(index);

      // Update canvas dimensions
      if (editor?.canvas) {
        editor.canvas.setDimensions({
          width: image.editable_area?.width,
          height: image.editable_area?.height,
        });

        // Load saved state for new image after a brief delay
        setTimeout(() => {
          loadCanvasState(index);
        }, 100);
      }
    },
    [saveCurrentCanvasState, loadCanvasState, editor]
  );
  // Auto-save canvas state when canvas changes
  useEffect(() => {
    if (editor?.canvas) {
      const handleObjectRemoved = () => {
        // Auto-save when objects are deleted
        saveCurrentCanvasState();
      };

      const handleObjectModified = () => {
        // Auto-save when objects are modified
        saveCurrentCanvasState();
      };

      // Listen for canvas changes
      editor.canvas.on("object:removed", handleObjectRemoved);
      editor.canvas.on("object:modified", handleObjectModified);
      editor.canvas.on("object:added", handleObjectModified);

      return () => {
        editor.canvas.off("object:removed", handleObjectRemoved);
        editor.canvas.off("object:modified", handleObjectModified);
        editor.canvas.off("object:added", handleObjectModified);
      };
    }
  }, [editor, saveCurrentCanvasState]);
  return (
    <div className="h-full flex flex-col">
      <Navbar
        id={initialData.id}
        editor={editor}
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
      />
      <div className="absolute h-[calc(100%-68px)] w-full top-[68px] flex">
        <Sidebar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />

        <TextSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FontSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ImageSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />

        <AiSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />

        <SettingsSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <div className="h-full flex flex-col w-full">
          <Toolbar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            key={JSON.stringify(editor?.canvas.getActiveObject())}
          />
          <main className="bg-muted overflow-auto flex justify-between items-center w-full flex-1 p-4 ">
            <div className="w-[80%] h-full flex justify-center items-center">
              <div
                className="w-[800px] h-full relative"
                style={{
                  backgroundImage: `url(${selectedImage.url || ""})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    border: "1px dotted gray",
                    top: `${selectedImage.editable_area?.y}px`,
                    left: `${selectedImage.editable_area?.x}px`,
                    transform: "translate(-50%, -50%)",
                    width: selectedImage.editable_area?.width,
                    height: selectedImage.editable_area?.height,
                  }}
                  ref={containerRef}
                >
                  <canvas
                    ref={canvasRef}
                    width={selectedImage.editable_area?.width}
                    height={selectedImage.editable_area?.height}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 h-full flex flex-col p-4 items-center">
              <h3>Locations</h3>
              {images.length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                  {images.map((image: any, index: number) => (
                    <div
                      key={index}
                      className={`flex flex-col items-center gap-2 cursor-pointer group 
                      }`}
                      onClick={() => handleImageSelect(image, index)}
                    >
                      <Image
                        src={image.url}
                        alt={`Product Thumbnail ${index + 1}`}
                        width={100}
                        height={100}
                        className={`p-4 rounded-lg bg-white transition-all duration-300 group-hover:shadow-md group-hover:border-[1px] group-hover:border-black ${
                          selectedImage === image
                            ? "border-[1px] border-black rounded-lg"
                            : ""
                        }`}
                      />
                      <p className="text-sm text-center group-hover:font-medium uppercase">
                        {image.view_side}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
