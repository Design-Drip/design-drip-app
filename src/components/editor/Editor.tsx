'use client'
import { useEditor } from '@/features/editor/hooks/use-editor';
import { ActiveTool, selectionDependentTools } from '@/features/editor/types';
import { Product } from '@/lib/data/products';
import { fabric } from 'fabric';
import debounce from "lodash.debounce";
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react'

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
      <div className="absolute h-full w-full top-[68px] flex">

        <main className="flex-1 overflow-auto relative flex flex-col">
          <Image src={initialData.thumbnail} width={500} height={500} alt='product' className='absolute' />
          <div className="flex-1 h-[300px] " ref={containerRef}>
            <canvas ref={canvasRef} />
          </div>
        </main>
      </div>
    </div>
  );
}