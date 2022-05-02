export interface CanvasState {
  displayReductionRatio: number;
  clickableRange: number;
  isMouseDown: boolean;
  hasRect: boolean;
}

export interface CanvasPosition {
  mouseDownX: number;
  mouseDownY: number;
  mouseMoveX: number;
  mouseMoveY: number;
  tempRectStartX: number;
  tempRectStartY: number;
  tempRectEndX: number;
  tempRectEndY: number;
  rectStartX: number;
  rectStartY: number;
  rectEndX: number;
  rectEndY: number;
}
