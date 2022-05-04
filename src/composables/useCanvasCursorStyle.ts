import { CanvasState, CanvasPosition } from '@/types/canvas';

type CursorStyle =
  | 'crosshair'
  | 'nwse-resize'
  | 'nesw-resize'
  | 'ns-resize'
  | 'ew-resize';

export const useCanvasCursorStyle = (
  canvasState: CanvasState,
  canvasPosition: CanvasPosition
) => {
  const getCanvasCursorStyle = () => {
    const { clickableRange } = canvasState;
    const {
      mouseMoveX,
      mouseMoveY,
      rectStartX,
      rectStartY,
      rectEndX,
      rectEndY,
    } = canvasPosition;

    let cursorStyle: CursorStyle = 'crosshair';

    if (canvasState.hasRect) {
      const mousePositionFromRect = {
        topLeft:
          rectStartX - clickableRange < mouseMoveX &&
          mouseMoveX < rectStartX + clickableRange &&
          rectStartY - clickableRange < mouseMoveY &&
          mouseMoveY < rectStartY + clickableRange,
        topRight:
          rectEndX - clickableRange < mouseMoveX &&
          mouseMoveX < rectEndX + clickableRange &&
          rectStartY - clickableRange < mouseMoveY &&
          mouseMoveY < rectStartY + clickableRange,
        bottomRight:
          rectEndX - clickableRange < mouseMoveX &&
          mouseMoveX < rectEndX + clickableRange &&
          rectEndY - clickableRange < mouseMoveY &&
          mouseMoveY < rectEndY + clickableRange,
        bottomLeft:
          rectStartX - clickableRange < mouseMoveX &&
          mouseMoveX < rectStartX + clickableRange &&
          rectEndY - clickableRange < mouseMoveY &&
          mouseMoveY < rectEndY + clickableRange,
        top:
          rectStartX - clickableRange < mouseMoveX &&
          mouseMoveX < rectEndX + clickableRange &&
          rectStartY - clickableRange < mouseMoveY &&
          mouseMoveY < rectStartY + clickableRange,
        right:
          rectEndX - clickableRange < mouseMoveX &&
          mouseMoveX < rectEndX + clickableRange &&
          rectStartY - clickableRange < mouseMoveY &&
          mouseMoveY < rectEndY + clickableRange,
        bottom:
          rectStartX - clickableRange < mouseMoveX &&
          mouseMoveX < rectEndX + clickableRange &&
          rectEndY - clickableRange < mouseMoveY &&
          mouseMoveY < rectEndY + clickableRange,
        left:
          rectStartX - clickableRange < mouseMoveX &&
          mouseMoveX < rectStartX + clickableRange &&
          rectStartY - clickableRange < mouseMoveY &&
          mouseMoveY < rectEndY + clickableRange,
      };

      if (mousePositionFromRect.topLeft || mousePositionFromRect.bottomRight) {
        cursorStyle = 'nwse-resize';
      } else if (
        mousePositionFromRect.topRight ||
        mousePositionFromRect.bottomLeft
      ) {
        cursorStyle = 'nesw-resize';
      } else if (mousePositionFromRect.top || mousePositionFromRect.bottom) {
        cursorStyle = 'ns-resize';
      } else if (mousePositionFromRect.right || mousePositionFromRect.left) {
        cursorStyle = 'ew-resize';
      }
    }

    return cursorStyle;
  };

  return {
    getCanvasCursorStyle,
  };
};
