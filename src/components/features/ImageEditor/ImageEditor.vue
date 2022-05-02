<template>
  <div v-loading="isLoading" style="width: 100%" class="image-editor">
    <div class="image-editor-layout">
      <div class="image-editor-main">
        <ImageEditorMenu
          :can-crop="canCrop"
          :crop-canvas-image="cropCanvasImage"
          :rotate-canvas-image="rotateCanvasImage" />
        <div class="image-canvas">
          <div ref="canvasContainer" class="image-canvas">
            <canvas ref="displayCanvas" class="display" />
            <canvas
              ref="drawingCanvas"
              class="drawing"
              @mousedown="onMouseDownCanvas"
              @mousemove="onMouseMoveCanvas" />
          </div>
        </div>
        <div class="operations">
          <el-button
            class="resetButton"
            plain
            :icon="RefreshLeft"
            @click="resetCanvasImage"
            >リセット</el-button
          >
          <el-button type="primary" :icon="Download" @click="onClickDownload"
            >編集した画像をダウンロード</el-button
          >
        </div>
        <el-button
          class="returnButton"
          type="text"
          plain
          :icon="Back"
          @click="returnUploader">
          画像を選択し直す
        </el-button>
      </div>
      <div class="image-editor-panel">
        <div class="panel-block">
          <ImageEditorInformation
            :image-size="imageSize"
            :canvas-state="canvasState" />
        </div>
        <div class="panel-block">
          <ImageEditorResize
            :image-size="imageSize"
            :update-image-resize="updateImageResize"
            :resize-canvas-image="resizeCanvasImage" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted, onBeforeUnmount } from 'vue';
import { UploadFile } from 'element-plus';
import { Download, RefreshLeft, Back } from '@element-plus/icons-vue';

import ImageEditorMenu from '@/components/features/ImageEditor/ImageEditorMenu.vue';
import ImageEditorInformation from '@/components/features/ImageEditor/ImageEditorInformation.vue';
import ImageEditorResize from '@/components/features/ImageEditor/ImageEditorResize.vue';

import { useImageData } from '@/composables/useImageData';
import { useCanvasState } from '@/composables/useCanvasState';
import { useCanvasPosition } from '@/composables/useCanvasPosition';
import { useCanvasCursorStyle } from '@/composables/useCanvasCursorStyle';
import { useFileDownload } from '@/composables/useFileDownload';
import { useBase64toBlob } from '@/composables/useBase64toBlob';
import { useLoading } from '@/composables/useLoading';
import { useMessage } from '@/composables/useMessage';

const props = defineProps<{
  uploadFile: UploadFile | undefined;
  returnUploader: () => void;
}>();

onMounted(() => {
  setCanvasImage();
});

const canvasContainer = ref<HTMLElement>();

const displayCanvas = ref<HTMLCanvasElement>();
const displayCanvasCtx = ref<CanvasRenderingContext2D | null>();

const drawingCanvas = ref<HTMLCanvasElement>();
const drawingCanvasCtx = ref<CanvasRenderingContext2D | null>();

const {
  imageData,
  updateOriginalImageFile,
  imageSize,
  canCrop,
  updateImageCurrentSize,
  updateImageCropSize,
  updateImageResize,
} = useImageData();

const {
  canvasState,
  calculateDisplayReductionRatio,
  updateIsMouseDown,
  updateHasRect,
} = useCanvasState();

const {
  canvasPosition,
  getMouseDownPosition,
  getMouseMovePosition,
  getCanvasRectSize,
  saveRectPosition,
  initializeRectPosition,
} = useCanvasPosition(imageSize, canvasState);

const { getCanvasCursorStyle } = useCanvasCursorStyle(
  canvasState,
  canvasPosition
);

const { downloadFile } = useFileDownload();
const { convertBase64toBlob } = useBase64toBlob();

const { isLoading, openLoading, closeLoading } = useLoading();
const { showMessage } = useMessage();

watchEffect(() => {
  const cropWidth = canvasPosition.tempRectEndX - canvasPosition.tempRectStartX;
  const cropHeght = canvasPosition.tempRectEndY - canvasPosition.tempRectStartY;
  updateImageCropSize(cropWidth, cropHeght);
});

const setCanvasContainerSize = (width: number, height: number) => {
  if (canvasContainer.value === undefined) return;
  canvasContainer.value.style.width =
    width * canvasState.displayReductionRatio + 'px';
  canvasContainer.value.style.height =
    height * canvasState.displayReductionRatio + 'px';
};

const setDrawingCanvasSize = (width: number, height: number) => {
  if (drawingCanvas.value === undefined) return;
  drawingCanvas.value.width = width;
  drawingCanvas.value.height = height;
};

const calculateCanvasDisplayReductionRatio = () => {
  if (displayCanvas.value === undefined) return;
  calculateDisplayReductionRatio(
    displayCanvas.value.clientWidth,
    displayCanvas.value.width
  );
};

const setCanvasImage = () => {
  openLoading();

  if (displayCanvas.value === undefined || drawingCanvas.value === undefined)
    return;
  displayCanvasCtx.value = displayCanvas.value.getContext('2d');
  drawingCanvasCtx.value = drawingCanvas.value.getContext('2d');

  updateOriginalImageFile(props.uploadFile?.raw);

  if (imageData.originalImageFile === undefined) return;

  const image = new Image();
  image.crossOrigin = 'anonymous';

  const fileReader = new FileReader();

  fileReader.onload = (event) => {
    image.onload = () => {
      const width = image.width;
      const height = image.height;

      if (displayCanvas.value === undefined) return;
      displayCanvas.value.width = width;
      displayCanvas.value.height = height;

      calculateCanvasDisplayReductionRatio();
      updateImageCurrentSize(width, height);
      setCanvasContainerSize(width, height);
      setDrawingCanvasSize(width, height);

      displayCanvasCtx.value?.drawImage(image, 0, 0);

      closeLoading();
    };
    image.onerror = () => {
      showMessage(
        'error',
        '画像の読み込みに失敗しました。しばらく経ってから、もう一度お試しください。',
        true
      );
      props.returnUploader();
    };

    const result = event.target?.result;
    image.src = result as string;
  };
  fileReader.readAsDataURL(imageData.originalImageFile);
};

const initializeCanvasRect = () => {
  initializeRectPosition();
  updateHasRect(false);
};

const resetCanvasImage = () => {
  initializeDrawingCanvas();
  initializeCanvasRect();
  setCanvasImage();
};

const initializeDrawingCanvas = () => {
  if (drawingCanvas.value === undefined) return;
  if (drawingCanvasCtx.value == undefined) return;

  drawingCanvasCtx.value.clearRect(
    0,
    0,
    drawingCanvas.value.width,
    drawingCanvas.value.height
  );
};

const onMouseDownCanvas = (event: MouseEvent) => {
  updateIsMouseDown(true);

  if (displayCanvas.value !== undefined) {
    const canvasRect = displayCanvas.value.getBoundingClientRect();
    getMouseDownPosition(event, canvasRect);
  }

  window.addEventListener('mousemove', selectCropArea);
  window.addEventListener('mouseup', onMouseUpWindow);
};

const drawOverlayDrawingCanvas = () => {
  if (drawingCanvas.value === undefined) return;
  if (drawingCanvasCtx.value == undefined) return;

  const option = {
    fillStyle: 'rgba(' + [0, 0, 0, 0.6] + ')',
    strokeStyle: 'white',
    setLineDash: [20, 10],
    lineWidth: 4,
  };

  drawingCanvasCtx.value.fillStyle = option.fillStyle;
  drawingCanvasCtx.value.fillRect(
    0,
    0,
    drawingCanvas.value.width,
    drawingCanvas.value.height
  );
};

const drawRectDrawingCanvas = () => {
  if (drawingCanvas.value === undefined) return;
  if (drawingCanvasCtx.value == undefined) return;

  updateHasRect(true);

  const option = {
    strokeStyle: 'white',
    setLineDash: [20, 10],
    lineWidth: 4,
  };

  drawingCanvasCtx.value.strokeStyle = option.strokeStyle;
  drawingCanvasCtx.value.setLineDash(option.setLineDash);
  drawingCanvasCtx.value.lineWidth = option.lineWidth;

  const { width, height } = getCanvasRectSize();
  const lineWidth = option.lineWidth;
  const harfLineWidth = option.lineWidth / 2;

  drawingCanvasCtx.value.strokeRect(
    canvasPosition.tempRectStartX,
    canvasPosition.tempRectStartY,
    width,
    height
  );
  drawingCanvasCtx.value.clearRect(
    canvasPosition.tempRectStartX + harfLineWidth,
    canvasPosition.tempRectStartY + harfLineWidth,
    width - lineWidth,
    height - lineWidth
  );
};

const selectCropArea = (event: MouseEvent) => {
  if (displayCanvas.value !== undefined) {
    const canvasRect = displayCanvas.value.getBoundingClientRect();
    getMouseMovePosition(event, canvasRect);
  }

  if (!canvasState.isMouseDown) return;
  initializeDrawingCanvas();
  drawOverlayDrawingCanvas();
  drawRectDrawingCanvas();
};

const changeCursorStyle = () => {
  if (drawingCanvas.value === undefined) return;

  const cursorStyle = getCanvasCursorStyle();
  drawingCanvas.value.style.cursor = cursorStyle;
};

const onMouseMoveCanvas = (event: MouseEvent) => {
  if (canvasState.isMouseDown) return;

  selectCropArea(event);
  changeCursorStyle();
};

const onMouseUpWindow = () => {
  window.removeEventListener('mousemove', selectCropArea);
  updateIsMouseDown(false);
  window.removeEventListener('mouseup', onMouseUpWindow);

  saveRectPosition();
};

const cropCanvasImage = () => {
  openLoading();

  if (imageSize.crop.width === 0 || imageSize.crop.height === 0) return;

  if (displayCanvas.value === undefined) return;
  const base64 = displayCanvas.value.toDataURL(
    imageData.originalImageFile?.type
  );
  const image = new Image();

  image.onload = () => {
    if (displayCanvasCtx.value == undefined) return;
    const width = imageSize.crop.width;
    const height = imageSize.crop.height;

    if (displayCanvas.value === undefined) return;
    displayCanvas.value.width = width;
    displayCanvas.value.height = height;

    calculateCanvasDisplayReductionRatio();
    updateImageCurrentSize(width, height);
    setCanvasContainerSize(width, height);
    setDrawingCanvasSize(width, height);

    displayCanvasCtx.value.drawImage(
      image,
      canvasPosition.rectStartX,
      canvasPosition.rectStartY,
      width,
      height,
      0,
      0,
      width,
      height
    );

    initializeCanvasRect();
    closeLoading();
  };

  image.src = base64;
};

const rotateCanvasImage = (direction: 'left' | 'right') => {
  openLoading();

  initializeDrawingCanvas();

  if (displayCanvas.value === undefined) return;
  const base64 = displayCanvas.value.toDataURL(
    imageData.originalImageFile?.type
  );
  const image = new Image();

  image.onload = () => {
    if (displayCanvas.value === undefined) return;
    const width = displayCanvas.value.height;
    const height = displayCanvas.value.width;

    displayCanvas.value.width = width;
    displayCanvas.value.height = height;

    updateImageCurrentSize(width, height);
    setCanvasContainerSize(width, height);
    setDrawingCanvasSize(width, height);

    const degree = direction === 'right' ? 90 : -90;

    if (displayCanvasCtx.value == undefined) return;
    displayCanvasCtx.value.save();
    displayCanvasCtx.value.translate(width / 2, height / 2);
    displayCanvasCtx.value.rotate((degree * Math.PI) / 180);
    displayCanvasCtx.value.translate(-image.width / 2, -image.height / 2);
    displayCanvasCtx.value.drawImage(image, 0, 0);
    displayCanvasCtx.value.restore();

    initializeCanvasRect();
    closeLoading();
  };

  image.src = base64;
};

const resizeCanvasImage = () => {
  if (displayCanvas.value === undefined) return;
  const base64 = displayCanvas.value.toDataURL(
    imageData.originalImageFile?.type
  );
  const image = new Image();

  image.onload = () => {
    if (displayCanvasCtx.value == undefined) return;
    const width = imageSize.resize.width;
    const height = imageSize.resize.height;

    if (displayCanvas.value === undefined) return;
    displayCanvas.value.width = width;
    displayCanvas.value.height = height;

    calculateCanvasDisplayReductionRatio();
    updateImageCurrentSize(width, height);
    setCanvasContainerSize(width, height);
    setDrawingCanvasSize(width, height);

    displayCanvasCtx.value.drawImage(image, 0, 0, width, height);

    initializeCanvasRect();
    closeLoading();
  };

  image.src = base64;
};

const onClickDownload = () => {
  if (displayCanvas.value === undefined) return;
  if (imageData.originalImageFile === undefined) return;

  const base64 = displayCanvas.value.toDataURL(
    imageData.originalImageFile.type
  );
  const fileName = imageData.originalImageFile.name;
  const blob = convertBase64toBlob(base64, fileName);

  downloadFile(blob, fileName);
};

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', selectCropArea);
  window.removeEventListener('mouseup', onMouseUpWindow);
});
</script>

<style scoped lang="scss">
.image-editor-layout {
  display: flex;
  justify-content: space-between;
  @include pre.mq(medium) {
    flex-direction: column;
    justify-content: flex-start;
  }
  > .image-editor-main {
    padding: 16px 16px 16px 0;
  }
  > .image-editor-panel {
    width: 372px;
    padding: 16px 16px 24px;
    background: #f7f7f7;
    @include pre.mq(medium) {
      width: 100%;
      margin-top: 32px;
    }
  }
}

.image-editor-main {
  > .operations {
    margin-top: 28px;
    @include pre.mq(minimum) {
      display: flex;
      flex-wrap: wrap;
      flex-direction: column-reverse;
      align-items: flex-start;
    }
  }
  // eslint-disable-next-line vue-scoped-css/no-unused-selector
  > .operations > .el-button + .el-button {
    margin-left: 0; // Element Plus default CSS 打ち消し
  }
  // eslint-disable-next-line vue-scoped-css/no-unused-selector
  > .operations > .el-button:not(:last-of-type) {
    margin-right: 10px;
    @include pre.mq(minimum) {
      margin-top: 10px;
    }
  }
  > .returnButton {
    margin-top: 20px;
  }
}

.image-canvas {
  position: relative;
  > .display,
  > .drawing {
    position: absolute;
    left: 0;
    top: 0;
    max-width: 500px;
    max-height: 500px;
    @include pre.mq(medium) {
      max-width: 300px;
      max-height: 300px;
    }
  }
  > .display {
    z-index: 0;
  }
  > .drawing {
    z-index: 2;
    cursor: crosshair;
    box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.1);
  }
}

.image-editor-panel {
  background: #f7f7f7;
  > .panel-block {
    &:not(:first-of-type) {
      margin-top: 28px;
      padding-top: 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.4);
    }
  }
}
</style>
