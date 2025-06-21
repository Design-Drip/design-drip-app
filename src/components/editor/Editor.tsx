'use client'
import { useEditor } from '@/features/editor/hooks/use-editor';
import { ActiveTool, JSON_KEYS, selectionDependentTools } from '@/features/editor/types';
import { Product } from '@/lib/data/products';
import { fabric } from 'fabric';
import debounce from "lodash.debounce";
import Image from 'next/image';
import React, { use, useCallback, useEffect, useRef, useState } from 'react'
import { Navbar } from './components/navbar';
import { Sidebar } from './components/sidebar';
import { Toolbar } from './components/toolbar';
import { Footer } from './components/footer';
import { TextSidebar } from './components/text-sidebar';
import { AiSidebar } from './components/ai-sidebar';
import { SettingsSidebar } from './components/settings-sidebar';
import { FontSidebar } from './components/font-sidebar';
import { ImageSidebar } from './components/image-sidebar';


interface EditorProps {
  initialData: Product
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

  const onChangeActiveTool = useCallback((tool: ActiveTool) => {
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
  }, [activeTool, editor]);

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

          <main className='bg-muted flex-1 overflow-auto relative flex justify-center items-center flex-col w-full'>
            <div
              className="w-[800px] h-[797px] relative"
              style={{
                backgroundImage: `url(${initialData.thumbnail})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
              }}
            >
              <div ref={containerRef} style={{ width: '300px', height: '300px', backgroundColor: 'transparent' }} >
                <div style={{ position: "absolute", border: "1px dotted gray", top: "30%", left: "30%" }} className="relative"
                >
                  <canvas
                    width="300"
                    height="300"
                    ref={canvasRef}
                  />
                </div>
              </div>

            </div>

          </main>
        </div>

      </div>
    </div>
  );
}