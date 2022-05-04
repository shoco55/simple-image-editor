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
          <ImageEditorOperation
            :reset-canvas-image="resetCanvasImage"
            :on-click-download="onClickDownload" />
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
import { Back } from '@element-plus/icons-vue';

import ImageEditorMenu from '@/components/features/ImageEditor/ImageEditorMenu.vue';
import ImageEditorInformation from '@/components/features/ImageEditor/ImageEditorInformation.vue';
import ImageEditorResize from '@/components/features/ImageEditor/ImageEditorResize.vue';

import { useImageData } from '@/composables/useImageData';
import { useCanvasState } from '@/composables/useCanvasState';
import { useCanvasPosition } from '@/composables/useCanvasPosition';
import { useCanvasCursorStyle } from '@/composables/useCanvasCursorStyle';
import { useLoadFileReader } from '@/composables/useLoadFileReader';
import { useLoadImage } from '@/composables/useLoadImage';
import { useFileDownload } from '@/composables/useFileDownload';
import { useBase64toBlob } from '@/composables/useBase64toBlob';
import { useLoading } from '@/composables/useLoading';
import { useMessage } from '@/composables/useMessage';
import ImageEditorOperation from './ImageEditorOperation.vue';

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

watchEffect(() => {
  if (displayCanvas.value === undefined) return;
  if (drawingCanvas.value === undefined) return;
  drawingCanvas.value.width = displayCanvas.value.width;
  drawingCanvas.value.height = displayCanvas.value.height;
});

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

const { loadImage } = useLoadImage();
const { loadFileReader } = useLoadFileReader();
const { downloadFile } = useFileDownload();
const { convertBase64toBlob } = useBase64toBlob();

const { isLoading, openLoading, closeLoading } = useLoading();
const { showMessage } = useMessage();

const updateCanvasContainerSize = (width: number, height: number) => {
  if (canvasContainer.value === undefined) return;
  canvasContainer.value.style.width =
    width * canvasState.displayReductionRatio + 'px';
  canvasContainer.value.style.height =
    height * canvasState.displayReductionRatio + 'px';
};

const updateCanvasSize = (width: number, height: number) => {
  if (displayCanvas.value === undefined) return;
  displayCanvas.value.width = width;
  displayCanvas.value.height = height;

  if (drawingCanvas.value === undefined) return;
  drawingCanvas.value.width = width;
  drawingCanvas.value.height = height;
};

watchEffect(() => {
  const cropWidth = canvasPosition.tempRectEndX - canvasPosition.tempRectStartX;
  const cropHeght = canvasPosition.tempRectEndY - canvasPosition.tempRectStartY;
  updateImageCropSize(cropWidth, cropHeght);
});

const calculateCanvasDisplayReductionRatio = () => {
  if (displayCanvas.value === undefined) return;
  calculateDisplayReductionRatio(
    displayCanvas.value.clientWidth,
    displayCanvas.value.width
  );
};

const updateAroundCanvasSize = (width: number, height: number) => {
  updateCanvasSize(width, height);
  updateImageCurrentSize(width, height);

  calculateCanvasDisplayReductionRatio();
  updateCanvasContainerSize(width, height);
};

const setCanvasImage = async () => {
  try {
    openLoading();

    updateOriginalImageFile(props.uploadFile?.raw);

    if (imageData.originalImageFile === undefined) throw new Error();

    const fileReaderResult = await loadFileReader(imageData.originalImageFile);
    const image = await loadImage(fileReaderResult as string);

    const width = image.width;
    const height = image.height;

    if (displayCanvas.value === undefined || drawingCanvas.value === undefined)
      return;
    displayCanvasCtx.value = displayCanvas.value.getContext('2d');
    drawingCanvasCtx.value = drawingCanvas.value.getContext('2d');

    updateAroundCanvasSize(width, height);

    displayCanvasCtx.value?.drawImage(image, 0, 0);
  } catch {
    showMessage(
      'error',
      '画像の読み込みに失敗しました。アプリの不具合の可能性があるため、アプリ管理者にご連絡ください。',
      true
    );
    props.returnUploader();
  } finally {
    closeLoading();
  }
};

const initializeCanvasRectData = () => {
  initializeRectPosition();
  updateHasRect(false);
};

const resetCanvasImage = () => {
  initializeDrawingCanvas();
  initializeCanvasRectData();
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

const cropCanvasImage = async () => {
  if (imageSize.crop.width === 0 || imageSize.crop.height === 0) return;

  try {
    openLoading();

    if (displayCanvas.value === undefined) return;
    if (displayCanvasCtx.value == undefined) return;

    const base64 = displayCanvas.value.toDataURL(
      imageData.originalImageFile?.type
    );

    const image = await loadImage(base64);

    const width = imageSize.crop.width;
    const height = imageSize.crop.height;

    updateAroundCanvasSize(width, height);

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

    initializeCanvasRectData();
  } catch (error) {
    showMessage(
      'error',
      '画像のトリミングに失敗しました。アプリの不具合の可能性があるため、アプリ管理者にご連絡ください。',
      true
    );
  } finally {
    closeLoading();
  }
};

const rotateCanvasImage = async (direction: 'left' | 'right') => {
  try {
    openLoading();

    if (displayCanvas.value === undefined) return;
    const base64 = displayCanvas.value.toDataURL(
      imageData.originalImageFile?.type
    );

    const image = await loadImage(base64);

    const width = displayCanvas.value.height;
    const height = displayCanvas.value.width;

    updateAroundCanvasSize(width, height);

    const degree = direction === 'right' ? 90 : -90;

    if (displayCanvasCtx.value == undefined) return;
    displayCanvasCtx.value.save();
    displayCanvasCtx.value.translate(width / 2, height / 2);
    displayCanvasCtx.value.rotate((degree * Math.PI) / 180);
    displayCanvasCtx.value.translate(-image.width / 2, -image.height / 2);
    displayCanvasCtx.value.drawImage(image, 0, 0);
    displayCanvasCtx.value.restore();

    initializeCanvasRectData();
  } catch (error) {
    showMessage(
      'error',
      '画像の回転に失敗しました。アプリの不具合の可能性があるため、アプリ管理者にご連絡ください。',
      true
    );
  } finally {
    closeLoading();
  }
};

const resizeCanvasImage = async () => {
  try {
    openLoading();

    if (displayCanvas.value === undefined) return;
    const base64 = displayCanvas.value.toDataURL(
      imageData.originalImageFile?.type
    );

    const image = await loadImage(base64);

    if (displayCanvasCtx.value == undefined) return;
    const width = imageSize.resize.width;
    const height = imageSize.resize.height;

    updateAroundCanvasSize(width, height);

    displayCanvasCtx.value.drawImage(image, 0, 0, width, height);

    initializeCanvasRectData();
  } catch (error) {
    showMessage(
      'error',
      '画像のリサイズに失敗しました。アプリの不具合の可能性があるため、アプリ管理者にご連絡ください。',
      true
    );
  } finally {
    closeLoading();
  }
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
