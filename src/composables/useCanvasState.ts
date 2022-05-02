import { reactive } from 'vue';

import { CanvasState } from '@/types/canvas';

export const useCanvasState = () => {
  const canvasState: CanvasState = reactive({
    displayReductionRatio: 1,
    clickableRange: 16,
    isMouseDown: false,
    hasRect: false,
  });

  const calculateDisplayReductionRatio = (
    canvasClientWidth: number,
    canvasWidth: number
  ) => {
    canvasState.displayReductionRatio = canvasClientWidth / canvasWidth;
  };

  const updateIsMouseDown = (flag: boolean) => {
    canvasState.isMouseDown = flag;
  };

  const updateHasRect = (flag: boolean) => {
    canvasState.hasRect = flag;
  };

  return {
    canvasState,
    calculateDisplayReductionRatio,
    updateIsMouseDown,
    updateHasRect,
  };
};
