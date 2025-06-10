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
import React, {
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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

interface EditorProps {
  initialData: Product;
}

export const Editor = ({ initialData }: EditorProps) => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const { init, editor } = useEditor({
    defaultState: initialData.json,
    defaultWidth: 300,
    defaultHeight: 300,
    clearSelectionCallback: onClearSelection,
  });
  console.log("activeTool", activeTool);

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
                  backgroundImage: `url(${initialData.thumbnail})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    border: "1px dotted gray",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "300px",
                    height: "300px",
                  }}
                  ref={containerRef}
                >
                  <canvas ref={canvasRef} width="300" height="300" />
                </div>
              </div>
            </div>

            <div className="flex-1 h-full flex flex-col p-4 items-center">
              <h3>Locations</h3>
              <div className="flex flex-col gap-2 overflow-y-auto h-full w-full">
                <div className="flex flex-col items-center gap-2 cursor-pointer group">
                  <Image
                    src={initialData.thumbnail}
                    alt="Product Thumbnail"
                    width={100}
                    height={100}
                    className="p-4 rounded-lg bg-white  transition-all duration-300 group-hover:shadow-md group-hover:border-[1px] group-hover:border-black "
                  />
                  <p className="text-sm text-center group-hover:font-medium">
                    Front
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2 cursor-pointer group">
                  <Image
                    src={initialData.thumbnail}
                    alt="Product Thumbnail"
                    width={100}
                    height={100}
                    className="p-4 rounded-lg bg-white  transition-all duration-300 group-hover:shadow-md group-hover:border-[1px] group-hover:border-black "
                  />
                  <p className="text-sm text-center group-hover:font-medium">
                    Back
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2 cursor-pointer group">
                  <Image
                    src={initialData.thumbnail}
                    alt="Product Thumbnail"
                    width={100}
                    height={100}
                    className="p-4 rounded-lg bg-white  transition-all duration-300 group-hover:shadow-md group-hover:border-[1px] group-hover:border-black"
                  />
                  <p className="text-sm text-center group-hover:font-medium">
                    Left Side
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2 cursor-pointer group">
                  <Image
                    src={initialData.thumbnail}
                    alt="Product Thumbnail"
                    width={100}
                    height={100}
                    className="p-4 rounded-lg bg-white  transition-all duration-300 group-hover:shadow-md group-hover:border-[1px] group-hover:border-black"
                  />
                  <p className="text-sm text-center group-hover:font-medium">
                    Right Side
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
