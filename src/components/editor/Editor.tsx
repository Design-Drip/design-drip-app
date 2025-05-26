'use client'
import { useEditor } from '@/features/editor/hooks/use-editor';
import { ActiveTool, selectionDependentTools } from '@/features/editor/types';
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
  const canvasRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // const { mutate } = useUpdateProject(initialData.id);
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // const debouncedSave = useCallback(
  //   debounce(
  //     (values: {
  //       json: string,
  //       height: number,
  //       width: number,
  //     }) => {
  //       mutate(values);
  //     },
  //     500
  //   ), [mutate]);

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const { init, editor } = useEditor({
    defaultState: initialData.json,
    defaultWidth: initialData.width,
    defaultHeight: initialData.height,
    clearSelectionCallback: onClearSelection,
    // saveCallback: debouncedSave,
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
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 500,
        backgroundColor: '#ffffff',
      });

      initCanvas.renderAll();
      setCanvas(initCanvas);

      return () => {
        initCanvas.dispose();
      }
    }
  }, []);
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

        {/* <FillColorSidebar
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
        /> */}
        {/* <OpacitySidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        /> */}
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
        {/* <TemplateSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        /> */}
        {/* <FilterSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        /> */}
        <AiSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        {/* <RemoveBgSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        /> */}
        {/* <DrawSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        /> */}
        <SettingsSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <main className="bg-muted flex-1 overflow-auto relative flex flex-col">
          <Toolbar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            key={JSON.stringify(editor?.canvas.getActiveObject())}
          />
          <div className="flex items-center justify-center h-full bg-muted" ref={containerRef}>
            <canvas ref={canvasRef} />
          </div>
          <Footer editor={editor} />
        </main>
      </div>
    </div>
  );
}