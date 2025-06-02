import { fabric } from "fabric";
import { useCallback, useEffect } from "react";

interface UseAutoResizeProps {
  canvas: fabric.Canvas | null;
  container: HTMLDivElement | null;
}

export const useAutoResize = ({ canvas, container }: UseAutoResizeProps) => {
  const autoZoom = useCallback(() => {
    if (!canvas || !container) {
      console.log('Cannot auto zoom: canvas or container is null');
      return;
    }

    try {
      const width = container.offsetWidth;
      const height = container.offsetHeight;

      canvas.setWidth(width);
      canvas.setHeight(height);

      const center = canvas.getCenter();

      const zoomRatio = 0.85;
      const localWorkspace = canvas
        .getObjects()
        .find((object) => object.name === "clip");

      if (!localWorkspace) {
        console.log('Cannot auto zoom: workspace not found');
        return;
      }

      // @ts-ignore
      const scale = fabric.util.findScaleToFit(localWorkspace, {
        width: width,
        height: height,
      });

      const zoom = zoomRatio * scale;

      canvas.setViewportTransform(fabric.iMatrix.concat());
      canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom);

      const workspaceCenter = localWorkspace.getCenterPoint();
      const viewportTransform = canvas.viewportTransform;

      if (
        canvas.width === undefined ||
        canvas.height === undefined ||
        !viewportTransform
      ) {
        console.log('Cannot complete auto zoom: canvas dimensions or viewportTransform unavailable');
        return;
      }

      viewportTransform[4] = canvas.width / 2 - workspaceCenter.x * viewportTransform[0];
      viewportTransform[5] = canvas.height / 2 - workspaceCenter.y * viewportTransform[3];

      canvas.setViewportTransform(viewportTransform);

      localWorkspace.clone((cloned: fabric.Rect) => {
        if (canvas) {  // Additional null check
          canvas.clipPath = cloned;
          canvas.requestRenderAll();
        }
      });
    } catch (error) {
      console.error('Error in autoZoom:', error);
    }
  }, [canvas, container]);

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;

    if (canvas && container) {
      resizeObserver = new ResizeObserver(() => {
        autoZoom();
      });

      resizeObserver.observe(container);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [canvas, container, autoZoom]);

  return {
    autoZoom: useCallback(() => {
      if (canvas && container) {
        autoZoom();
      } else {
        console.log('autoZoom called but canvas or container is not ready yet');
      }
    }, [canvas, container, autoZoom])
  };
};
