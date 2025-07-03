"use client";
import { useEditor } from "@/features/editor/hooks/use-editor";
import { ActiveTool, selectionDependentTools } from "@/features/editor/types";
import { fabric } from "fabric";
import debounce from "lodash.debounce";
import Image from "next/image";
import React, { use, useCallback, useEffect, useRef, useState } from "react";
import { Navbar } from "./components/navbar";
import { Sidebar } from "./components/sidebar";
import { Toolbar } from "./components/toolbar";
import { Footer } from "./components/footer";
import { AiSidebar } from "./components/ai-sidebar";
import { SettingsSidebar } from "./components/settings-sidebar";
import { FontSidebar } from "./components/font-sidebar";
import { ImageSidebar } from "./components/image-sidebar";
import { DesignTemplateSidebar } from "./components/design-template-sidebar";
import { useCreateDesign } from "@/features/design/use-create-design";
import { toast } from "sonner";
import { ProductImage } from "@/types/product";
import { TextSidebar } from "./components/text-sidebar";
import { useUser } from "@clerk/clerk-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FillColorSidebar } from "./components/fill-color-sidebar";
// Add near your imports
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { useUpdateDesign } from "@/features/design/use-update-design";
import { useQueryClient } from "@tanstack/react-query";
import { FilterSidebar } from "./components/filter-sidebar";
import { StrokeColorSidebar } from "./components/stroke-color-sidebar";
import { StrokeWidthSidebar } from "./components/stroke-width-sidebar";
import { RemoveBgSidebar } from "./components/remove-bg-sidebar";
import { OpacitySidebar } from "./components/opacity-sidebar";

// Add inside your component
const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface EditorProps {
  images: ProductImage[];
  productColorId: string;
  designDetail?: any; // Optional design detail for editing
}

export const Editor = ({
  images,
  productColorId,
  designDetail,
}: EditorProps) => {
  //State management
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [canvasStates, setCanvasStates] = useState<{
    [key: number]: string;
  }>({});
  const [selectedImage, setSelectedImage] = useState<any>(images[0] || {});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const [designName, setDesignName] = useState<string>("Shirt Design");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    designDetail?.template_id || null
  );

  // Refs to prevent infinite loops
  const isUpdatingCanvas = useRef(false);
  const didAttemptLocalStorageLoad = useRef(false);
  const queryClient = useQueryClient();

  // Authentication
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  //mutation
  const createDesignMutation = useCreateDesign();
  const updateDesignMutation = useUpdateDesign();

  // Add this to use the new route
  const { startUpload, isUploading } = useUploadThing("designCanvas");
  // Add this function to convert canvas to file and upload
  const uploadCanvasImage = async (
    canvas: any,
    viewName: string,
    imageUrl?: string
  ): Promise<string> => {
    try {
      // If we have a background image URL, create a composite image with background
      if (imageUrl) {
        // Create an off-screen canvas for compositing
        const compositeCanvas = document.createElement("canvas");
        const ctx = compositeCanvas.getContext("2d");

        if (!ctx) {
          throw new Error("Failed to get 2D context");
        }

        // Set canvas size to match the product image dimensions
        compositeCanvas.width = 800;
        compositeCanvas.height = 797;

        // Load the background image
        const bgImage = new window.Image();
        bgImage.crossOrigin = "anonymous";

        // Wait for background image to load
        await new Promise<void>((resolve, reject) => {
          bgImage.onload = () => resolve();
          bgImage.onerror = () =>
            reject(new Error("Failed to load background image"));
          bgImage.src = imageUrl;
        });

        // Draw background image
        ctx.drawImage(
          bgImage,
          0,
          0,
          compositeCanvas.width,
          compositeCanvas.height
        );

        // Find the image in the images array that matches this URL
        const imageData = images.find((img) => img.url === imageUrl);
        const xPosition = imageData ? imageData.x_editable_zone + 20 : 20;
        const yPosition = imageData ? imageData.y_editable_zone : 20;

        // Convert canvas to data URL
        const canvasDataURL = canvas.toDataURL({
          format: "png",
          quality: 0.9,
          multiplier: 1,
        });

        // Load canvas content as an image
        const canvasImage = new window.Image();
        canvasImage.crossOrigin = "anonymous";

        // Wait for canvas image to load
        await new Promise<void>((resolve, reject) => {
          canvasImage.onload = () => resolve();
          canvasImage.onerror = () =>
            reject(new Error("Failed to load canvas image"));
          canvasImage.src = canvasDataURL;
        });

        // Draw canvas content at the correct position
        const width = imageData ? imageData.width_editable_zone : canvas.width;
        const height = imageData
          ? imageData.height_editable_zone
          : canvas.height;

        ctx.drawImage(canvasImage, xPosition, yPosition, width, height);

        // Convert the composite canvas to a blob
        const compositeDataURL = compositeCanvas.toDataURL("image/png");
        const res = await fetch(compositeDataURL);
        const blob = await res.blob();

        // Create a file from the blob
        const file = new File([blob], `design-${viewName}.png`, {
          type: "image/png",
        });

        // Upload the file using Uploadthing
        const uploadResult = await startUpload([file]);

        if (uploadResult && uploadResult[0]) {
          return uploadResult[0].url;
        }

        throw new Error("Upload failed");
      } else {
        // Fallback for cases where we don't have a background URL
        const dataURL = canvas.toDataURL({
          format: "png",
          quality: 0.8,
          multiplier: 2,
        });

        const res = await fetch(dataURL);
        const blob = await res.blob();

        const file = new File([blob], `design-${viewName}.png`, {
          type: "image/png",
        });

        const uploadResult = await startUpload([file]);

        if (uploadResult && uploadResult[0]) {
          return uploadResult[0].url;
        }

        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error(`Error uploading canvas for ${viewName}:`, error);
      throw error;
    }
  };
  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const { init, editor } = useEditor({
    // defaultState: initialData.json,
    defaultWidth: selectedImage.width_editable_zone,
    defaultHeight: selectedImage.height_editable_zone,
    clearSelectionCallback: onClearSelection,
  });

  // Save current canvas state before switching
  const saveCurrentCanvasState = useCallback(() => {
    if (!editor?.canvas) return canvasStates;

    try {
      const canvasJson = editor.canvas.toJSON();
      const timestamp = new Date().toISOString();

      // Only update state if the canvas has changed
      const newCanvasStates = {
        ...canvasStates,
        [selectedImageIndex]: JSON.stringify({
          canvas: canvasJson,
          metadata: {
            lastModified: timestamp,
            objectCount: editor.canvas.getObjects().length,
            canvasDimensions: {
              width: selectedImage.width_editable_zone,
              height: selectedImage.height_editable_zone,
            },
          },
        }),
      };

      // Check if state is actually different before updating
      if (JSON.stringify(newCanvasStates) !== JSON.stringify(canvasStates)) {
        setCanvasStates(newCanvasStates);
      }

      return newCanvasStates;
    } catch (error) {
      console.error("Error saving canvas state:", error);
      return canvasStates;
    }
  }, [editor, selectedImageIndex, selectedImage, canvasStates]);

  // Handle design name change
  const handleDesignNameChange = useCallback((name: string) => {
    setDesignName(name);
    setHasUnsavedChanges(true);
  }, []);

  // Save to database function with authentication check
  const saveToDatabase = useCallback(async () => {
    // Check if user is authenticated
    if (!isLoaded) {
      // Still loading auth state, maybe show a loading indicator
      toast.loading("Checking authentication...");
      return;
    }

    if (!isSignedIn) {
      try {
        // Get current canvas state
        const currentState = saveCurrentCanvasState();

        // Save to localStorage
        localStorage.setItem(
          "designDripEditorState",
          JSON.stringify({
            productColorId,
            canvasStates: currentState,
            designName,
            timestamp: new Date().toISOString(),
          })
        );

        toast.info("Please sign in to save your design");
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
      // Build the redirect URL with all parameters
      const params = new URLSearchParams(searchParams.toString());

      // Ensure colorId parameter is included
      if (!params.has("colorId") && productColorId) {
        params.set("colorId", productColorId);
      }

      // Construct full redirect URL
      let fullRedirectUrl = pathname;
      if (params.toString()) {
        fullRedirectUrl += `?${params.toString()}`;
      }
      // Navigate to sign-in with redirect URL
      router.push(
        `/sign-in?redirect_url=${encodeURIComponent(fullRedirectUrl)}`
      );
      return;
    }

    if (!editor?.canvas) return;

    // // Save the current canvas state
    // const currentState = saveCurrentCanvasState();

    setIsSaving(true);
    setSaveError(null);

    try {
      // Get the current canvas state directly
      const elementDesign: { [key: string]: any } = {};
      const designImages: { [key: string]: string } = {};

      // First, update the current canvas state
      const currentCanvasJson = editor.canvas.toJSON();
      const currentStateJson = JSON.stringify({
        canvas: currentCanvasJson,
        metadata: {
          lastModified: new Date().toISOString(),
          objectCount: editor.canvas.getObjects().length,
          canvasDimensions: {
            width: selectedImage.width_editable_zone,
            height: selectedImage.height_editable_zone,
          },
        },
      });

      // Create a copy of canvasStates with the updated current state
      const allStates = {
        ...canvasStates,
        [selectedImageIndex]: currentStateJson,
      };

      // Process all canvas states
      for (const [imageIndex, canvasJson] of Object.entries(allStates)) {
        const index = parseInt(imageIndex);
        const image = images[index];

        if (image && image.id) {
          elementDesign[imageIndex] = {
            images_id: image.id,
            element_Json: canvasJson,
          };

          // Generate image for each canvas state
          if (index === selectedImageIndex) {
            // For the current canvas, use the active editor
            const imageUrl = await uploadCanvasImage(
              editor.canvas,
              `view-${index}`,
              image.url
            );

            designImages[imageIndex] = imageUrl;
          } else {
            // For other canvases, we need to temporarily load them
            try {
              const tempCanvas = new fabric.Canvas(null);
              tempCanvas.setDimensions({
                width: images[index].width_editable_zone,
                height: images[index].height_editable_zone,
              });

              const stateData = JSON.parse(canvasJson);
              await new Promise<void>((resolve) => {
                tempCanvas.loadFromJSON(
                  stateData.canvas || stateData,
                  async () => {
                    const imageUrl = await uploadCanvasImage(
                      tempCanvas,
                      `view-${index}`,
                      image.url
                    );
                    designImages[imageIndex] = imageUrl;
                    tempCanvas.dispose();
                    resolve();
                  }
                );
              });
            } catch (error) {
              console.error(
                `Error generating image for canvas ${index}:`,
                error
              );
            }
          }
        }
      }

      // Save to database if there's design data
      if (Object.keys(elementDesign).length > 0) {
        console.log("Saving design with template ID:", selectedTemplateId);

        const designData = {
          shirt_color_id: productColorId,
          element_design: elementDesign,
          name: designName || "Shirt Design",
          design_images: designImages,
          template_id: selectedTemplateId,
          template_applied_at: selectedTemplateId
            ? new Date().toISOString()
            : null,
        };
        if (designDetail && designDetail._id) {
          // We're updating an existing design
          await updateDesignMutation.mutateAsync({
            ...designData,
            id: designDetail._id, // Pass the ID for updating
          });
          queryClient.invalidateQueries({ queryKey: ["designs"] });
          toast.success("Design updated successfully!");
        } else {
          // We're creating a new design
          await createDesignMutation.mutateAsync(designData);
          toast.success("Design saved successfully!");
        }

        // Update canvasStates without triggering effects
        setCanvasStates(allStates);
        setHasUnsavedChanges(false);

        // Clear localStorage after successful save
        localStorage.removeItem("designDripEditorState");
      }
    } catch (error) {
      setSaveError(error as Error);
      toast.error("Failed to save design.");
    } finally {
      setIsSaving(false);
    }
  }, [
    editor,
    images,
    productColorId,
    selectedImageIndex,
    selectedImage,
    canvasStates,
    createDesignMutation,
    updateDesignMutation,
    isSignedIn,
    isLoaded,
    router,
    pathname,
    searchParams,
    saveCurrentCanvasState,
    designName,
    designDetail,
  ]);

  // Load canvas state for selected image
  const loadCanvasState = useCallback(
    (imageIndex: number) => {
      if (!editor?.canvas) {
        console.error("Cannot load canvas state: editor or canvas is null");
        return;
      }

      try {
        console.log(`Loading canvas state for image index: ${imageIndex}`);

        // Clear the canvas first to avoid artifacts
        editor.canvas.clear();
        isUpdatingCanvas.current = true;

        if (canvasStates[imageIndex]) {
          console.log(`Found saved state for index ${imageIndex}`);
          const savedState = JSON.parse(canvasStates[imageIndex]);
          const canvasData = savedState.canvas || savedState; // Backward compatibility

          editor.canvas.loadFromJSON(canvasData, () => {
            editor.canvas.renderAll();
            console.log(`Canvas state loaded for index ${imageIndex}`);
            isUpdatingCanvas.current = false;
          });
        } else {
          console.log(
            `No saved state found for index ${imageIndex}, clearing canvas`
          );
          editor.canvas.clear();
          isUpdatingCanvas.current = false;
        }
      } catch (error) {
        console.error("Error loading canvas state:", error);
        editor.canvas.clear();
        isUpdatingCanvas.current = false;
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

  // Initialize canvas
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
      if (isUpdatingCanvas.current) return;
      isUpdatingCanvas.current = true;

      // First save current canvas state
      saveCurrentCanvasState();

      // Update selected image
      setSelectedImage(image);
      setSelectedImageIndex(index);
      if (editor?.canvas) {
        editor.canvas.setDimensions({
          width: image.width_editable_zone,
          height: image.height_editable_zone,
        });

        // Load saved state for new image after a brief delay
        setTimeout(() => {
          loadCanvasState(index);
          isUpdatingCanvas.current = false;
        }, 100);
      }
      // Update canvas dimensions
      // Load the canvas state after a brief delay
    },
    [editor, selectedImageIndex, selectedImage, canvasStates]
  );
  // Load from localStorage only once after editor is initialized
  useEffect(() => {
    console.log("Editor initialized, checking localStorage...");
    if (editor?.canvas && !didAttemptLocalStorageLoad.current) {
      console.log("Attempting to load from localStorage...");
      didAttemptLocalStorageLoad.current = true;

      try {
        const storedData = localStorage.getItem("designDripEditorState");
        console.log("Stored data found:", !!storedData);

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log(
            "Parsed localStorage data - productColorId:",
            parsedData.productColorId
          );
          console.log("Current productColorId:", productColorId);
          console.log("Has canvasStates:", !!parsedData.canvasStates);

          if (
            parsedData.productColorId === productColorId &&
            parsedData.canvasStates &&
            parsedData.designName
          ) {
            console.log("Product ID matches, setting canvas states");

            // Set canvas states from localStorage
            setCanvasStates(parsedData.canvasStates);
            setHasUnsavedChanges(true);
            setDesignName(parsedData.designName);

            // Use a longer timeout to ensure states are set before loading
            setTimeout(() => {
              console.log("Timeout completed, loading canvas state");
              try {
                // Get the state for the selected image
                const stateData = parsedData.canvasStates[selectedImageIndex];
                if (!stateData) {
                  console.log(
                    "No state data for selected image index:",
                    selectedImageIndex
                  );
                  return;
                }

                console.log("Found state data for index:", selectedImageIndex);

                // Parse the state data
                const parsedState = JSON.parse(stateData);

                // Extract the canvas data
                const canvasData = parsedState.canvas;
                if (!canvasData || !canvasData.objects) {
                  console.log("Invalid canvas data structure");
                  return;
                }

                console.log(
                  "Canvas data has",
                  canvasData.objects.length,
                  "objects"
                );

                // Set canvas dimensions if available
                if (parsedState.metadata?.canvasDimensions) {
                  console.log(
                    "Setting canvas dimensions:",
                    parsedState.metadata.canvasDimensions
                  );
                  editor.canvas.setDimensions({
                    width: parsedState.metadata.canvasDimensions.width,
                    height: parsedState.metadata.canvasDimensions.height,
                  });
                }

                // Clear the canvas first
                editor.canvas.clear();

                // Load the canvas JSON with callback
                editor.canvas.loadFromJSON(canvasData, () => {
                  // Ensure all objects are visible and within bounds
                  const objects = editor.canvas.getObjects();
                  objects.forEach((obj) => {
                    // Make sure object is visible
                    obj.visible = true;

                    // If object is a textbox with negative position, fix it
                    if (
                      obj.type === "textbox" &&
                      ((obj.left ?? 0) < 0 || (obj.top ?? 0) < 0)
                    ) {
                      console.log(
                        "Fixing position of text object that was outside canvas"
                      );
                      obj.set({
                        left: Math.max(10, obj.left ?? 0),
                        top: Math.max(10, obj.top ?? 0),
                      });
                    }
                  });

                  // Render the canvas
                  editor.canvas.renderAll();
                  console.log(
                    "Canvas rendered with",
                    objects.length,
                    "objects"
                  );
                });
              } catch (error) {
                console.error("Error loading canvas state in timeout:", error);
              }
            }, 800); // Longer timeout for more reliability
          }
        }
      } catch (error) {
        console.error("Error loading from localStorage:", error);
      }
    }
  }, [editor, productColorId, selectedImageIndex]);
  console.log("canvasStates", canvasStates);
  // Add this inside your component
  useEffect(() => {
    console.log("Current canvasStates:", canvasStates);
    console.log("Selected image index:", selectedImageIndex);
    console.log(
      "Has canvas state for selected image?",
      !!canvasStates[selectedImageIndex]
    );
    console.log("Editor canvas ready?", !!editor?.canvas);
  }, [canvasStates, selectedImageIndex, editor]);
  // Track canvas changes to set unsaved changes flag
  useEffect(() => {
    if (!editor?.canvas) return;

    const handleObjectChanged = () => {
      if (!isUpdatingCanvas.current) {
        setHasUnsavedChanges(true);
      }
    };

    // Listen for canvas changes
    editor.canvas.on("object:modified", handleObjectChanged);
    editor.canvas.on("object:added", handleObjectChanged);
    editor.canvas.on("object:removed", handleObjectChanged);

    return () => {
      editor.canvas.off("object:modified", handleObjectChanged);
      editor.canvas.off("object:added", handleObjectChanged);
      editor.canvas.off("object:removed", handleObjectChanged);
    };
  }, [editor]);

  // Additional effect to set hasUnsavedChanges to true when canvas objects are added
  useEffect(() => {
    // This function will be called after any tool is used to add objects
    const markAsUnsaved = () => {
      if (
        activeTool !== "select" &&
        editor?.canvas &&
        editor.canvas.getObjects().length > 0
      ) {
        setHasUnsavedChanges(true);
      }
    };

    // Run this check whenever activeTool changes back to select (after using another tool)
    if (activeTool === "select") {
      markAsUnsaved();
    }
  }, [activeTool, editor]);

  // Track changes for text additions
  useEffect(() => {
    const handleTextAdded = () => {
      if (activeTool === "text" && editor?.canvas) {
        setHasUnsavedChanges(true);
      }
    };

    if (editor?.canvas && activeTool === "text") {
      editor.canvas.on("text:changed", handleTextAdded);
      return () => {
        editor.canvas.off("text:changed", handleTextAdded);
      };
    }
  }, [activeTool, editor]);

  useEffect(() => {
    if (
      editor?.canvas &&
      !didAttemptLocalStorageLoad.current &&
      !didLoadDesignDetail.current
    ) {
      console.log("Attempting to load from localStorage...");
      didAttemptLocalStorageLoad.current = true;

      try {
        const storedData = localStorage.getItem("designDripEditorState");
        console.log("Stored data found:", !!storedData);

        if (storedData) {
          // Rest of your localStorage loading code...
        }
      } catch (error) {
        console.error("Error loading from localStorage:", error);
      }
    }
  }, [editor, productColorId, selectedImageIndex]);
  // Add a new ref to track if we've loaded from designDetail
  const didLoadDesignDetail = useRef(false);

  useEffect(() => {
    if (designDetail && editor?.canvas && !didLoadDesignDetail.current) {
      didLoadDesignDetail.current = true;
      // We need to set this to prevent localStorage loading from overriding our design
      didAttemptLocalStorageLoad.current = true;

      try {
        // Extract and process the element_design data
        const savedCanvasStates: { [key: number]: string } = {};

        // Set the design name
        setDesignName(designDetail.name || "Shirt Design");

        // Process each element design (different views)
        Object.entries(designDetail.element_design).forEach(
          ([viewIndex, design]: [string, any]) => {
            const index = parseInt(viewIndex);

            // Store the JSON data in our canvas states
            if (design && design.element_Json) {
              savedCanvasStates[index] = design.element_Json;
            }
          }
        );

        // Update canvas states
        setCanvasStates(savedCanvasStates);

        // Load the canvas state for the current view
        if (savedCanvasStates[selectedImageIndex]) {
          // Wait a moment for the canvas to be fully initialized
          setTimeout(() => {
            try {
              // Get the state for the selected image
              const stateData = savedCanvasStates[selectedImageIndex];
              const parsedState = JSON.parse(stateData);

              // Extract the canvas data - handle both formats
              const canvasData = parsedState.canvas || parsedState;

              // Set canvas dimensions if needed
              if (parsedState.metadata?.canvasDimensions) {
                editor.canvas.setDimensions({
                  width: parsedState.metadata.canvasDimensions.width,
                  height: parsedState.metadata.canvasDimensions.height,
                });
              }

              // Clear the canvas first
              editor.canvas.clear();

              // Load the canvas JSON
              editor.canvas.loadFromJSON(canvasData, () => {
                // Ensure all objects are visible and within bounds
                const objects = editor.canvas.getObjects();
                objects.forEach((obj) => {
                  // Make sure object is visible
                  obj.visible = true;

                  // If object is a textbox with negative position, fix it
                  if (
                    obj.type === "textbox" &&
                    ((obj.left ?? 0) < 0 || (obj.top ?? 0) < 0)
                  ) {
                    console.log(
                      "Fixing position of text object that was outside canvas"
                    );
                    obj.set({
                      left: Math.max(10, obj.left ?? 0),
                      top: Math.max(10, obj.top ?? 0),
                    });
                  }
                });

                editor.canvas.renderAll();
                console.log(
                  "Design loaded successfully with",
                  objects.length,
                  "objects"
                );
              });
            } catch (error) {
              console.error("Error loading design state:", error);
            }
          }, 500);
        }
      } catch (error) {
        console.error("Error processing design detail:", error);
      }
    }
  }, [designDetail, editor, selectedImageIndex]);
  return (
    <div className="h-full flex flex-col">
      <Navbar
        editor={editor}
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
        onSave={saveToDatabase}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        saveError={saveError}
        designName={designName}
        onDesignNameChange={handleDesignNameChange}
      />
      <div className="absolute h-[calc(100%-68px)] w-full top-[68px] flex">
        <Sidebar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FillColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeWidthSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <OpacitySidebar
          editor={editor}
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
        <FilterSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <AiSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />

        <DesignTemplateSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={(templateId) => {
            console.log("Setting selectedTemplateId to:", templateId);
            setSelectedTemplateId(templateId);
            // Set unsaved changes flag
            setHasUnsavedChanges(true);
          }}
        />
        <RemoveBgSidebar
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
                className="w-[800px] h-[797px] relative"
                style={{
                  backgroundImage: `url(${selectedImage.url || ""})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    border: "1px dotted gray",
                    top: `${selectedImage.y_editable_zone}px`,
                    left: `${selectedImage.x_editable_zone + 20}px`,
                    width: selectedImage.width_editable_zone,
                    height: selectedImage.height_editable_zone,
                  }}
                  ref={containerRef}
                >
                  <canvas
                    ref={canvasRef}
                    width={selectedImage.width_editable_zone}
                    height={selectedImage.height_editable_zone}
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
