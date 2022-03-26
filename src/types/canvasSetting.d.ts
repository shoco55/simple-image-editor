export interface CanvasSetting {
  displayReductionRatio: number;
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
  clickableRange: number;
  isMouseDown: boolean;
  isMouseWithinRect: boolean;
  hasRect: boolean;
}
