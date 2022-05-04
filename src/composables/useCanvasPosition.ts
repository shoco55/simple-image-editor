import { reactive } from 'vue';

import { ImageSize } from '@/types/image';
import { CanvasPosition, CanvasState } from '@/types/canvas';

export const useCanvasPosition = (
  imageSize: ImageSize,
  canvasState: CanvasState
) => {
  const canvasPosition: CanvasPosition = reactive({
    mouseDownX: 0,
    mouseDownY: 0,
    mouseMoveX: 0,
    mouseMoveY: 0,
    tempRectStartX: 0,
    tempRectStartY: 0,
    tempRectEndX: 0,
    tempRectEndY: 0,
    rectStartX: 0,
    rectStartY: 0,
    rectEndX: 0,
    rectEndY: 0,
  });

  const getMouseDownPosition = (
    event: MouseEvent,
    canvasBoundingClientRect: { left: number; top: number }
  ) => {
    const elementLeft = window.pageXOffset + canvasBoundingClientRect.left;
    const elementTop = window.pageYOffset + canvasBoundingClientRect.top;

    const clickPositionX = event.pageX - elementLeft;
    const clickPositionY = event.pageY - elementTop;

    canvasPosition.mouseDownX = Math.round(
      clickPositionX / canvasState.displayReductionRatio
    );
    canvasPosition.mouseDownY = Math.round(
      clickPositionY / canvasState.displayReductionRatio
    );
  };

  const getMouseMovePosition = (
    event: MouseEvent,
    canvasBoundingClientRect: { left: number; top: number }
  ) => {
    const elementLeft = window.pageXOffset + canvasBoundingClientRect.left;
    const elementTop = window.pageYOffset + canvasBoundingClientRect.top;

    const clickPositionX = event.pageX - elementLeft;
    const clickPositionY = event.pageY - elementTop;

    canvasPosition.mouseMoveX = Math.round(
      clickPositionX / canvasState.displayReductionRatio
    );
    canvasPosition.mouseMoveY = Math.round(
      clickPositionY / canvasState.displayReductionRatio
    );

    const offCanvasDirection = {
      topLeft: canvasPosition.mouseMoveX < 0 && canvasPosition.mouseMoveY < 0,
      topRight:
        imageSize.current.width < canvasPosition.mouseMoveX &&
        canvasPosition.mouseMoveY < 0,
      bottomRight:
        imageSize.current.width < canvasPosition.mouseMoveX &&
        imageSize.current.height < canvasPosition.mouseMoveY,
      bottomLeft:
        canvasPosition.mouseMoveX < 0 &&
        imageSize.current.height < canvasPosition.mouseMoveY,
      top: canvasPosition.mouseMoveY < 0,
      right: imageSize.current.width < canvasPosition.mouseMoveX,
      bottom: imageSize.current.height < canvasPosition.mouseMoveY,
      left: canvasPosition.mouseMoveX < 0,
    };

    if (offCanvasDirection.topLeft) {
      canvasPosition.mouseMoveX = 0;
      canvasPosition.mouseMoveY = 0;
    } else if (offCanvasDirection.topRight) {
      canvasPosition.mouseMoveX = imageSize.current.width;
      canvasPosition.mouseMoveY = 0;
    } else if (offCanvasDirection.bottomRight) {
      canvasPosition.mouseMoveX = imageSize.current.width;
      canvasPosition.mouseMoveY = imageSize.current.height;
    } else if (offCanvasDirection.bottomLeft) {
      canvasPosition.mouseMoveX = 0;
      canvasPosition.mouseMoveY = imageSize.current.height;
    } else if (offCanvasDirection.top) {
      canvasPosition.mouseMoveY = 0;
    } else if (offCanvasDirection.right) {
      canvasPosition.mouseMoveX = imageSize.current.width;
    } else if (offCanvasDirection.bottom) {
      canvasPosition.mouseMoveY = imageSize.current.height;
    } else if (offCanvasDirection.left) {
      canvasPosition.mouseMoveX = 0;
    }
  };

  const getCanvasRectSize = () => {
    const clickableRange = canvasState.clickableRange;

    const transformRect = {
      fromTopLeft:
        canvasPosition.rectStartX - clickableRange <
          canvasPosition.mouseDownX &&
        canvasPosition.mouseDownX <
          canvasPosition.rectStartX + clickableRange &&
        canvasPosition.rectStartY - clickableRange <
          canvasPosition.mouseDownY &&
        canvasPosition.mouseDownY < canvasPosition.rectStartY + clickableRange,
      fromTopRight:
        canvasPosition.rectEndX - clickableRange < canvasPosition.mouseDownX &&
        canvasPosition.mouseDownX < canvasPosition.rectEndX + clickableRange &&
        canvasPosition.rectStartY - clickableRange <
          canvasPosition.mouseDownY &&
        canvasPosition.mouseDownY < canvasPosition.rectStartY + clickableRange,
      fromBottomRight:
        canvasPosition.rectEndX - clickableRange < canvasPosition.mouseDownX &&
        canvasPosition.mouseDownX < canvasPosition.rectEndX + clickableRange &&
        canvasPosition.rectEndY - clickableRange < canvasPosition.mouseDownY &&
        canvasPosition.mouseDownY < canvasPosition.rectEndY + clickableRange,
      fromBottomLeft:
        canvasPosition.rectStartX - clickableRange <
          canvasPosition.mouseDownX &&
        canvasPosition.mouseDownX <
          canvasPosition.rectStartX + clickableRange &&
        canvasPosition.rectEndY - clickableRange < canvasPosition.mouseDownY &&
        canvasPosition.mouseDownY < canvasPosition.rectEndY + clickableRange,
      fromTop:
        canvasPosition.rectStartX - clickableRange <
          canvasPosition.mouseDownX &&
        canvasPosition.mouseDownX < canvasPosition.rectEndX + clickableRange &&
        canvasPosition.rectStartY - clickableRange <
          canvasPosition.mouseDownY &&
        canvasPosition.mouseDownY < canvasPosition.rectStartY + clickableRange,
      fromRight:
        canvasPosition.rectEndX - clickableRange < canvasPosition.mouseDownX &&
        canvasPosition.mouseDownX < canvasPosition.rectEndX + clickableRange &&
        canvasPosition.rectStartY - clickableRange <
          canvasPosition.mouseDownY &&
        canvasPosition.mouseDownY < canvasPosition.rectEndY + clickableRange,
      fromBottom:
        canvasPosition.rectStartX - clickableRange <
          canvasPosition.mouseDownX &&
        canvasPosition.mouseDownX < canvasPosition.rectEndX + clickableRange &&
        canvasPosition.rectEndY - clickableRange < canvasPosition.mouseDownY &&
        canvasPosition.mouseDownY < canvasPosition.rectEndY + clickableRange,
      fromLeft:
        canvasPosition.rectStartX - clickableRange <
          canvasPosition.mouseDownX &&
        canvasPosition.mouseDownX <
          canvasPosition.rectStartX + clickableRange &&
        canvasPosition.rectStartY - clickableRange <
          canvasPosition.mouseDownY &&
        canvasPosition.mouseDownY < canvasPosition.rectEndY + clickableRange,
    };

    if (transformRect.fromTopLeft) {
      if (canvasPosition.mouseMoveX < canvasPosition.rectEndX) {
        canvasPosition.tempRectStartX = canvasPosition.mouseMoveX;
        canvasPosition.tempRectEndX = canvasPosition.rectEndX;
      } else {
        canvasPosition.tempRectStartX = canvasPosition.rectEndX;
        canvasPosition.tempRectEndX = canvasPosition.mouseMoveX;
      }
      if (canvasPosition.mouseMoveY < canvasPosition.rectEndY) {
        canvasPosition.tempRectStartY = canvasPosition.mouseMoveY;
        canvasPosition.tempRectEndY = canvasPosition.rectEndY;
      } else {
        canvasPosition.tempRectStartY = canvasPosition.rectEndY;
        canvasPosition.tempRectEndY = canvasPosition.mouseMoveY;
      }
    } else if (transformRect.fromTopRight) {
      if (canvasPosition.rectStartX < canvasPosition.mouseMoveX) {
        canvasPosition.tempRectStartX = canvasPosition.rectStartX;
        canvasPosition.tempRectEndX = canvasPosition.mouseMoveX;
      } else {
        canvasPosition.tempRectStartX = canvasPosition.mouseMoveX;
        canvasPosition.tempRectEndX = canvasPosition.rectStartX;
      }
      if (canvasPosition.mouseMoveY < canvasPosition.rectEndY) {
        canvasPosition.tempRectStartY = canvasPosition.mouseMoveY;
        canvasPosition.tempRectEndY = canvasPosition.rectEndY;
      } else {
        canvasPosition.tempRectStartY = canvasPosition.rectEndY;
        canvasPosition.tempRectEndY = canvasPosition.mouseMoveY;
      }
    } else if (transformRect.fromBottomRight) {
      if (canvasPosition.rectStartX < canvasPosition.mouseMoveX) {
        canvasPosition.tempRectStartX = canvasPosition.rectStartX;
        canvasPosition.tempRectEndX = canvasPosition.mouseMoveX;
      } else {
        canvasPosition.tempRectStartX = canvasPosition.mouseMoveX;
        canvasPosition.tempRectEndX = canvasPosition.rectStartX;
      }
      if (canvasPosition.rectStartY < canvasPosition.mouseMoveY) {
        canvasPosition.tempRectStartY = canvasPosition.rectStartY;
        canvasPosition.tempRectEndY = canvasPosition.mouseMoveY;
      } else {
        canvasPosition.tempRectStartY = canvasPosition.mouseMoveY;
        canvasPosition.tempRectEndY = canvasPosition.rectStartY;
      }
    } else if (transformRect.fromBottomLeft) {
      if (canvasPosition.mouseMoveX < canvasPosition.rectEndX) {
        canvasPosition.tempRectStartX = canvasPosition.mouseMoveX;
        canvasPosition.tempRectEndX = canvasPosition.rectEndX;
      } else {
        canvasPosition.tempRectStartX = canvasPosition.rectEndX;
        canvasPosition.tempRectEndX = canvasPosition.mouseMoveX;
      }
      if (canvasPosition.rectStartY < canvasPosition.mouseMoveY) {
        canvasPosition.tempRectStartY = canvasPosition.rectStartY;
        canvasPosition.tempRectEndY = canvasPosition.mouseMoveY;
      } else {
        canvasPosition.tempRectStartY = canvasPosition.mouseMoveY;
        canvasPosition.tempRectEndY = canvasPosition.rectStartY;
      }
    } else if (transformRect.fromTop) {
      canvasPosition.tempRectStartX = canvasPosition.rectStartX;
      canvasPosition.tempRectEndX = canvasPosition.rectEndX;
      if (canvasPosition.mouseMoveY < canvasPosition.rectEndY) {
        canvasPosition.tempRectStartY = canvasPosition.mouseMoveY;
        canvasPosition.tempRectEndY = canvasPosition.rectEndY;
      } else {
        canvasPosition.tempRectStartY = canvasPosition.rectEndY;
        canvasPosition.tempRectEndY = canvasPosition.mouseMoveY;
      }
    } else if (transformRect.fromRight) {
      if (canvasPosition.rectStartX < canvasPosition.mouseMoveX) {
        canvasPosition.tempRectStartX = canvasPosition.rectStartX;
        canvasPosition.tempRectEndX = canvasPosition.mouseMoveX;
      } else {
        canvasPosition.tempRectStartX = canvasPosition.mouseMoveX;
        canvasPosition.tempRectEndX = canvasPosition.rectStartX;
      }
      canvasPosition.tempRectStartY = canvasPosition.rectStartY;
      canvasPosition.tempRectEndY = canvasPosition.rectEndY;
    } else if (transformRect.fromBottom) {
      canvasPosition.tempRectStartX = canvasPosition.rectStartX;
      canvasPosition.tempRectEndX = canvasPosition.rectEndX;
      if (canvasPosition.rectStartY < canvasPosition.mouseMoveY) {
        canvasPosition.tempRectStartY = canvasPosition.rectStartY;
        canvasPosition.tempRectEndY = canvasPosition.mouseMoveY;
      } else {
        canvasPosition.tempRectStartY = canvasPosition.mouseMoveY;
        canvasPosition.tempRectEndY = canvasPosition.rectStartY;
      }
    } else if (transformRect.fromLeft) {
      if (canvasPosition.mouseMoveX < canvasPosition.rectEndX) {
        canvasPosition.tempRectStartX = canvasPosition.mouseMoveX;
        canvasPosition.tempRectEndX = canvasPosition.rectEndX;
      } else {
        canvasPosition.tempRectStartX = canvasPosition.rectEndX;
        canvasPosition.tempRectEndX = canvasPosition.mouseMoveX;
      }
      canvasPosition.tempRectStartY = canvasPosition.rectStartY;
      canvasPosition.tempRectEndY = canvasPosition.rectEndY;
    } else {
      if (canvasPosition.mouseDownX < canvasPosition.mouseMoveX) {
        canvasPosition.tempRectStartX = canvasPosition.mouseDownX;
        canvasPosition.tempRectEndX = canvasPosition.mouseMoveX;
      } else {
        canvasPosition.tempRectStartX = canvasPosition.mouseMoveX;
        canvasPosition.tempRectEndX = canvasPosition.mouseDownX;
      }

      if (canvasPosition.mouseDownY < canvasPosition.mouseMoveY) {
        canvasPosition.tempRectStartY = canvasPosition.mouseDownY;
        canvasPosition.tempRectEndY = canvasPosition.mouseMoveY;
      } else {
        canvasPosition.tempRectStartY = canvasPosition.mouseMoveY;
        canvasPosition.tempRectEndY = canvasPosition.mouseDownY;
      }
    }

    const width = canvasPosition.tempRectEndX - canvasPosition.tempRectStartX;
    const height = canvasPosition.tempRectEndY - canvasPosition.tempRectStartY;

    return { width, height };
  };

  const saveRectPosition = () => {
    canvasPosition.rectStartX = canvasPosition.tempRectStartX;
    canvasPosition.rectEndX = canvasPosition.tempRectEndX;
    canvasPosition.rectStartY = canvasPosition.tempRectStartY;
    canvasPosition.rectEndY = canvasPosition.tempRectEndY;
  };

  const initializeRectPosition = () => {
    canvasPosition.tempRectStartX = 0;
    canvasPosition.tempRectStartY = 0;
    canvasPosition.tempRectEndX = 0;
    canvasPosition.tempRectEndY = 0;
    canvasPosition.rectStartX = 0;
    canvasPosition.rectStartY = 0;
    canvasPosition.rectEndX = 0;
    canvasPosition.rectEndY = 0;
  };

  return {
    canvasPosition,
    getMouseDownPosition,
    getMouseMovePosition,
    getCanvasRectSize,
    saveRectPosition,
    initializeRectPosition,
  };
};
