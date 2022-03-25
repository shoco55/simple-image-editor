<template>
  <div v-loading="isLoading" style="width: 100%" class="image-editor">
    <div class="image-editor-layout">
      <div class="image-editor-main">
        <h2 class="image-editor-heading">
          編集メニュー
          <el-tooltip
            content="画像をトリミングするには、画像上をクリックしてからドラッグで範囲を選択して、<br>「選択範囲をトリミング」ボタンを押下してください。<br>選択範囲のサイズは「編集情報」で確認できます。"
            raw-content
            placement="top-start">
            <el-button class="tooltipIcon" :icon="QuestionFilled" circle />
          </el-tooltip>
        </h2>
        <div class="menu">
          <el-button
            type="primary"
            plain
            :disabled="!canCrop"
            @click="cropImage"
            >選択範囲をトリミング</el-button
          >
          <el-button type="primary" plain @click="rotateImage('right')"
            >右に90°回転</el-button
          >
          <el-button type="primary" plain @click="rotateImage('left')"
            >左に90°回転</el-button
          >
        </div>
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
          <el-button type="primary" :icon="Download" @click="downloadImage"
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
          <h2 class="image-editor-heading">編集情報</h2>
          <p class="text">
            現在のサイズ：{{ uploadImage.currentSize.width }} ×
            {{ uploadImage.currentSize.height }} px
          </p>
          <p class="text">
            選択範囲：
            <template v-if="canvas.hasRect"
              >{{ uploadImage.cropSize.width }} ×
              {{ uploadImage.cropSize.height }} px</template
            >
            <template v-else>未選択</template>
          </p>
        </div>
        <div class="panel-block">
          <h2 class="image-editor-heading">
            リサイズ
            <el-tooltip
              content="元の画像のサイズ比率を保ったまま、サイズを変更できます。<br>現在のサイズより拡大することはできません。<br><br>トリミング範囲選択中にリサイズすると、選択範囲が解除されます。<br>トリミング後に縮尺の変更を行いたい場合は、<br>範囲選択後に「選択範囲をトリミング」を押下してから、<br>リサイズを行って下さい。"
              raw-content
              placement="top-start">
              <el-button class="tooltipIcon" :icon="QuestionFilled" circle />
            </el-tooltip>
          </h2>
          <div class="resize-form">
            <span class="label">新規サイズ：</span>
            <div class="content">
              <el-input-number
                v-model="uploadImage.resize.width"
                :min="1"
                :max="uploadImage.currentSize.width"
                controls-position="right"
                @change="onChangeResizeWidth" />
              <span>×</span>
              <el-input-number
                v-model="uploadImage.resize.height"
                :min="1"
                :max="uploadImage.currentSize.height"
                controls-position="right"
                @change="onChangeResizeHeight" />
              <span>px</span>
            </div>
          </div>
          <div class="resizeButton">
            <el-button type="primary" plain @click="resizeImage"
              >新規サイズに変更</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  watchEffect,
  computed,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { UploadFile, UploadRawFile, ElNotification } from 'element-plus';
import {
  QuestionFilled,
  Download,
  RefreshLeft,
  Back,
} from '@element-plus/icons-vue';

interface UploadImage {
  originalFile: UploadRawFile | undefined;
  currentSize: {
    width: number;
    height: number;
  };
  cropSize: {
    width: number;
    height: number;
  };
  resize: {
    width: number;
    height: number;
  };
}

interface CanvasSetting {
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

const props = defineProps<{
  uploadFile: UploadFile | undefined;
}>();

onMounted(() => {
  setCanvasImage();
});

const isLoading = ref(true);

const openLoading = () => {
  isLoading.value = true;
};

const closeLoading = () => {
  isLoading.value = false;
};

const uploadImage: UploadImage = reactive({
  originalFile: undefined,
  currentSize: {
    width: 0,
    height: 0,
  },
  cropSize: {
    width: 0,
    height: 0,
  },
  resize: {
    width: 0,
    height: 0,
  },
});

const canvas: CanvasSetting = reactive({
  displayReductionRatio: 1,
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
  clickableRange: 16,
  isMouseDown: false,
  isMouseWithinRect: false,
  hasRect: false,
});

const canvasContainer = ref<HTMLElement>();

const displayCanvas = ref<HTMLCanvasElement>();
const displayCanvasCtx = ref<CanvasRenderingContext2D | null>();

const drawingCanvas = ref<HTMLCanvasElement>();
const drawingCanvasCtx = ref<CanvasRenderingContext2D | null>();

const calculateCanvasRatio = () => {
  if (displayCanvas.value === undefined) return;
  canvas.displayReductionRatio =
    displayCanvas.value.clientWidth / displayCanvas.value.width;
};

const resizeCanvasContainer = (width: number, height: number) => {
  if (canvasContainer.value === undefined) return;
  canvasContainer.value.style.width =
    width * canvas.displayReductionRatio + 'px';
  canvasContainer.value.style.height =
    height * canvas.displayReductionRatio + 'px';
};

const resizeDrawingCanvas = (width: number, height: number) => {
  if (drawingCanvas.value === undefined) return;
  drawingCanvas.value.width = width;
  drawingCanvas.value.height = height;
};

const saveUploadImageCurrentSize = (width: number, height: number) => {
  uploadImage.currentSize.width = width;
  uploadImage.currentSize.height = height;
};

const showErrorMessage = (message: string) => {
  ElNotification({
    title: 'Error',
    message: message,
    type: 'error',
  });
};

const setCanvasImage = () => {
  openLoading();

  if (displayCanvas.value === undefined || drawingCanvas.value === undefined)
    return;
  displayCanvasCtx.value = displayCanvas.value.getContext('2d');
  drawingCanvasCtx.value = drawingCanvas.value.getContext('2d');

  uploadImage.originalFile = props.uploadFile?.raw;

  if (uploadImage.originalFile === undefined) return;

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

      calculateCanvasRatio();
      saveUploadImageCurrentSize(width, height);
      resizeCanvasContainer(width, height);
      resizeDrawingCanvas(width, height);

      displayCanvasCtx.value?.drawImage(image, 0, 0);

      closeLoading();
    };
    image.onerror = () => {
      showErrorMessage(
        '画像の読み込みに失敗しました。しばらく経ってから、もう一度お試しください。'
      );
      returnUploader();
    };

    const result = event.target?.result;
    image.src = result as string;
  };
  fileReader.readAsDataURL(uploadImage.originalFile);
};

const onMouseDownCanvas = (event: MouseEvent) => {
  canvas.isMouseDown = true;

  getMouseDownPosition(event);

  window.addEventListener('mousemove', selectCropArea);
  window.addEventListener('mouseup', onMouseUpWindow);
};

const getMouseDownPosition = (event: MouseEvent) => {
  if (displayCanvas.value === undefined) return;
  const rect = displayCanvas.value.getBoundingClientRect();
  const elementLeft = window.pageXOffset + rect.left;
  const elementTop = window.pageYOffset + rect.top;

  const clickPositionX = event.pageX - elementLeft;
  const clickPositionY = event.pageY - elementTop;

  canvas.mouseDownX = Math.round(clickPositionX / canvas.displayReductionRatio);
  canvas.mouseDownY = Math.round(clickPositionY / canvas.displayReductionRatio);
};

const getMouseMovePosition = (event: MouseEvent) => {
  if (drawingCanvas.value === undefined) return;
  const rect = drawingCanvas.value.getBoundingClientRect();
  const elementLeft = window.pageXOffset + rect.left;
  const elementTop = window.pageYOffset + rect.top;

  const clickPositionX = event.pageX - elementLeft;
  const clickPositionY = event.pageY - elementTop;

  canvas.mouseMoveX = Math.round(clickPositionX / canvas.displayReductionRatio);
  canvas.mouseMoveY = Math.round(clickPositionY / canvas.displayReductionRatio);

  const offCanvasDirection = {
    topLeft: canvas.mouseMoveX < 0 && canvas.mouseMoveY < 0,
    topRight:
      uploadImage.currentSize.width < canvas.mouseMoveX &&
      canvas.mouseMoveY < 0,
    bottomRight:
      uploadImage.currentSize.width < canvas.mouseMoveX &&
      uploadImage.currentSize.height < canvas.mouseMoveY,
    bottomLeft:
      canvas.mouseMoveX < 0 &&
      uploadImage.currentSize.height < canvas.mouseMoveY,
    top: canvas.mouseMoveY < 0,
    right: uploadImage.currentSize.width < canvas.mouseMoveX,
    bottom: uploadImage.currentSize.height < canvas.mouseMoveY,
    left: canvas.mouseMoveX < 0,
  };

  if (offCanvasDirection.topLeft) {
    canvas.mouseMoveX = 0;
    canvas.mouseMoveY = 0;
  } else if (offCanvasDirection.topRight) {
    canvas.mouseMoveX = uploadImage.currentSize.width;
    canvas.mouseMoveY = 0;
  } else if (offCanvasDirection.bottomRight) {
    canvas.mouseMoveX = uploadImage.currentSize.width;
    canvas.mouseMoveY = uploadImage.currentSize.height;
  } else if (offCanvasDirection.bottomLeft) {
    canvas.mouseMoveX = 0;
    canvas.mouseMoveY = uploadImage.currentSize.height;
  } else if (offCanvasDirection.top) {
    canvas.mouseMoveY = 0;
  } else if (offCanvasDirection.right) {
    canvas.mouseMoveX = uploadImage.currentSize.width;
  } else if (offCanvasDirection.bottom) {
    canvas.mouseMoveY = uploadImage.currentSize.height;
  } else if (offCanvasDirection.left) {
    canvas.mouseMoveX = 0;
  }
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

  canvas.hasRect = true;

  const option = {
    strokeStyle: 'white',
    setLineDash: [20, 10],
    lineWidth: 4,
  };

  drawingCanvasCtx.value.strokeStyle = option.strokeStyle;
  drawingCanvasCtx.value.setLineDash(option.setLineDash);
  drawingCanvasCtx.value.lineWidth = option.lineWidth;

  const clickableRange = canvas.clickableRange;

  const transformRect = {
    fromTopLeft:
      canvas.rectStartX - clickableRange < canvas.mouseDownX &&
      canvas.mouseDownX < canvas.rectStartX + clickableRange &&
      canvas.rectStartY - clickableRange < canvas.mouseDownY &&
      canvas.mouseDownY < canvas.rectStartY + clickableRange,
    fromTopRight:
      canvas.rectEndX - clickableRange < canvas.mouseDownX &&
      canvas.mouseDownX < canvas.rectEndX + clickableRange &&
      canvas.rectStartY - clickableRange < canvas.mouseDownY &&
      canvas.mouseDownY < canvas.rectStartY + clickableRange,
    fromBottomRight:
      canvas.rectEndX - clickableRange < canvas.mouseDownX &&
      canvas.mouseDownX < canvas.rectEndX + clickableRange &&
      canvas.rectEndY - clickableRange < canvas.mouseDownY &&
      canvas.mouseDownY < canvas.rectEndY + clickableRange,
    fromBottomLeft:
      canvas.rectStartX - clickableRange < canvas.mouseDownX &&
      canvas.mouseDownX < canvas.rectStartX + clickableRange &&
      canvas.rectEndY - clickableRange < canvas.mouseDownY &&
      canvas.mouseDownY < canvas.rectEndY + clickableRange,
    fromTop:
      canvas.rectStartX - clickableRange < canvas.mouseDownX &&
      canvas.mouseDownX < canvas.rectEndX + clickableRange &&
      canvas.rectStartY - clickableRange < canvas.mouseDownY &&
      canvas.mouseDownY < canvas.rectStartY + clickableRange,
    fromRight:
      canvas.rectEndX - clickableRange < canvas.mouseDownX &&
      canvas.mouseDownX < canvas.rectEndX + clickableRange &&
      canvas.rectStartY - clickableRange < canvas.mouseDownY &&
      canvas.mouseDownY < canvas.rectEndY + clickableRange,
    fromBottom:
      canvas.rectStartX - clickableRange < canvas.mouseDownX &&
      canvas.mouseDownX < canvas.rectEndX + clickableRange &&
      canvas.rectEndY - clickableRange < canvas.mouseDownY &&
      canvas.mouseDownY < canvas.rectEndY + clickableRange,
    fromLeft:
      canvas.rectStartX - clickableRange < canvas.mouseDownX &&
      canvas.mouseDownX < canvas.rectStartX + clickableRange &&
      canvas.rectStartY - clickableRange < canvas.mouseDownY &&
      canvas.mouseDownY < canvas.rectEndY + clickableRange,
  };

  if (transformRect.fromTopLeft) {
    if (canvas.mouseMoveX < canvas.rectEndX) {
      canvas.tempRectStartX = canvas.mouseMoveX;
      canvas.tempRectEndX = canvas.rectEndX;
    } else {
      canvas.tempRectStartX = canvas.rectEndX;
      canvas.tempRectEndX = canvas.mouseMoveX;
    }
    if (canvas.mouseMoveY < canvas.rectEndY) {
      canvas.tempRectStartY = canvas.mouseMoveY;
      canvas.tempRectEndY = canvas.rectEndY;
    } else {
      canvas.tempRectStartY = canvas.rectEndY;
      canvas.tempRectEndY = canvas.mouseMoveY;
    }
  } else if (transformRect.fromTopRight) {
    if (canvas.rectStartX < canvas.mouseMoveX) {
      canvas.tempRectStartX = canvas.rectStartX;
      canvas.tempRectEndX = canvas.mouseMoveX;
    } else {
      canvas.tempRectStartX = canvas.mouseMoveX;
      canvas.tempRectEndX = canvas.rectStartX;
    }
    if (canvas.mouseMoveY < canvas.rectEndY) {
      canvas.tempRectStartY = canvas.mouseMoveY;
      canvas.tempRectEndY = canvas.rectEndY;
    } else {
      canvas.tempRectStartY = canvas.rectEndY;
      canvas.tempRectEndY = canvas.mouseMoveY;
    }
  } else if (transformRect.fromBottomRight) {
    if (canvas.rectStartX < canvas.mouseMoveX) {
      canvas.tempRectStartX = canvas.rectStartX;
      canvas.tempRectEndX = canvas.mouseMoveX;
    } else {
      canvas.tempRectStartX = canvas.mouseMoveX;
      canvas.tempRectEndX = canvas.rectStartX;
    }
    if (canvas.rectStartY < canvas.mouseMoveY) {
      canvas.tempRectStartY = canvas.rectStartY;
      canvas.tempRectEndY = canvas.mouseMoveY;
    } else {
      canvas.tempRectStartY = canvas.mouseMoveY;
      canvas.tempRectEndY = canvas.rectStartY;
    }
  } else if (transformRect.fromBottomLeft) {
    if (canvas.mouseMoveX < canvas.rectEndX) {
      canvas.tempRectStartX = canvas.mouseMoveX;
      canvas.tempRectEndX = canvas.rectEndX;
    } else {
      canvas.tempRectStartX = canvas.rectEndX;
      canvas.tempRectEndX = canvas.mouseMoveX;
    }
    if (canvas.rectStartY < canvas.mouseMoveY) {
      canvas.tempRectStartY = canvas.rectStartY;
      canvas.tempRectEndY = canvas.mouseMoveY;
    } else {
      canvas.tempRectStartY = canvas.mouseMoveY;
      canvas.tempRectEndY = canvas.rectStartY;
    }
  } else if (transformRect.fromTop) {
    canvas.tempRectStartX = canvas.rectStartX;
    canvas.tempRectEndX = canvas.rectEndX;
    if (canvas.mouseMoveY < canvas.rectEndY) {
      canvas.tempRectStartY = canvas.mouseMoveY;
      canvas.tempRectEndY = canvas.rectEndY;
    } else {
      canvas.tempRectStartY = canvas.rectEndY;
      canvas.tempRectEndY = canvas.mouseMoveY;
    }
  } else if (transformRect.fromRight) {
    if (canvas.rectStartX < canvas.mouseMoveX) {
      canvas.tempRectStartX = canvas.rectStartX;
      canvas.tempRectEndX = canvas.mouseMoveX;
    } else {
      canvas.tempRectStartX = canvas.mouseMoveX;
      canvas.tempRectEndX = canvas.rectStartX;
    }
    canvas.tempRectStartY = canvas.rectStartY;
    canvas.tempRectEndY = canvas.rectEndY;
  } else if (transformRect.fromBottom) {
    canvas.tempRectStartX = canvas.rectStartX;
    canvas.tempRectEndX = canvas.rectEndX;
    if (canvas.rectStartY < canvas.mouseMoveY) {
      canvas.tempRectStartY = canvas.rectStartY;
      canvas.tempRectEndY = canvas.mouseMoveY;
    } else {
      canvas.tempRectStartY = canvas.mouseMoveY;
      canvas.tempRectEndY = canvas.rectStartY;
    }
  } else if (transformRect.fromLeft) {
    if (canvas.mouseMoveX < canvas.rectEndX) {
      canvas.tempRectStartX = canvas.mouseMoveX;
      canvas.tempRectEndX = canvas.rectEndX;
    } else {
      canvas.tempRectStartX = canvas.rectEndX;
      canvas.tempRectEndX = canvas.mouseMoveX;
    }
    canvas.tempRectStartY = canvas.rectStartY;
    canvas.tempRectEndY = canvas.rectEndY;
  } else {
    if (canvas.mouseDownX < canvas.mouseMoveX) {
      canvas.tempRectStartX = canvas.mouseDownX;
      canvas.tempRectEndX = canvas.mouseMoveX;
    } else {
      canvas.tempRectStartX = canvas.mouseMoveX;
      canvas.tempRectEndX = canvas.mouseDownX;
    }

    if (canvas.mouseDownY < canvas.mouseMoveY) {
      canvas.tempRectStartY = canvas.mouseDownY;
      canvas.tempRectEndY = canvas.mouseMoveY;
    } else {
      canvas.tempRectStartY = canvas.mouseMoveY;
      canvas.tempRectEndY = canvas.mouseDownY;
    }
  }

  const width = canvas.tempRectEndX - canvas.tempRectStartX;
  const height = canvas.tempRectEndY - canvas.tempRectStartY;
  const lineWidth = option.lineWidth;
  const harfLineWidth = option.lineWidth / 2;

  drawingCanvasCtx.value.strokeRect(
    canvas.tempRectStartX,
    canvas.tempRectStartY,
    width,
    height
  );
  drawingCanvasCtx.value.clearRect(
    canvas.tempRectStartX + harfLineWidth,
    canvas.tempRectStartY + harfLineWidth,
    width - lineWidth,
    height - lineWidth
  );
};

watchEffect(() => {
  uploadImage.cropSize.width = canvas.tempRectEndX - canvas.tempRectStartX;
});

watchEffect(() => {
  uploadImage.cropSize.height = canvas.tempRectEndY - canvas.tempRectStartY;
});

const selectCropArea = (event: MouseEvent) => {
  getMouseMovePosition(event);

  if (!canvas.isMouseDown) return;
  resetDrawingCanvas();
  drawOverlayDrawingCanvas();
  drawRectDrawingCanvas();
};

const canCrop = computed(() => {
  return uploadImage.cropSize.width > 0 && uploadImage.cropSize.height > 0;
});

const changeCursorStyle = () => {
  if (drawingCanvas.value === undefined) return;

  const clickableRange = canvas.clickableRange;

  if (canvas.hasRect) {
    const mousePositionFromRect = {
      topLeft:
        canvas.rectStartX - clickableRange < canvas.mouseMoveX &&
        canvas.mouseMoveX < canvas.rectStartX + clickableRange &&
        canvas.rectStartY - clickableRange < canvas.mouseMoveY &&
        canvas.mouseMoveY < canvas.rectStartY + clickableRange,
      topRight:
        canvas.rectEndX - clickableRange < canvas.mouseMoveX &&
        canvas.mouseMoveX < canvas.rectEndX + clickableRange &&
        canvas.rectStartY - clickableRange < canvas.mouseMoveY &&
        canvas.mouseMoveY < canvas.rectStartY + clickableRange,
      bottomRight:
        canvas.rectEndX - clickableRange < canvas.mouseMoveX &&
        canvas.mouseMoveX < canvas.rectEndX + clickableRange &&
        canvas.rectEndY - clickableRange < canvas.mouseMoveY &&
        canvas.mouseMoveY < canvas.rectEndY + clickableRange,
      bottomLeft:
        canvas.rectStartX - clickableRange < canvas.mouseMoveX &&
        canvas.mouseMoveX < canvas.rectStartX + clickableRange &&
        canvas.rectEndY - clickableRange < canvas.mouseMoveY &&
        canvas.mouseMoveY < canvas.rectEndY + clickableRange,
      top:
        canvas.rectStartX - clickableRange < canvas.mouseMoveX &&
        canvas.mouseMoveX < canvas.rectEndX + clickableRange &&
        canvas.rectStartY - clickableRange < canvas.mouseMoveY &&
        canvas.mouseMoveY < canvas.rectStartY + clickableRange,
      right:
        canvas.rectEndX - clickableRange < canvas.mouseMoveX &&
        canvas.mouseMoveX < canvas.rectEndX + clickableRange &&
        canvas.rectStartY - clickableRange < canvas.mouseMoveY &&
        canvas.mouseMoveY < canvas.rectEndY + clickableRange,
      bottom:
        canvas.rectStartX - clickableRange < canvas.mouseMoveX &&
        canvas.mouseMoveX < canvas.rectEndX + clickableRange &&
        canvas.rectEndY - clickableRange < canvas.mouseMoveY &&
        canvas.mouseMoveY < canvas.rectEndY + clickableRange,
      left:
        canvas.rectStartX - clickableRange < canvas.mouseMoveX &&
        canvas.mouseMoveX < canvas.rectStartX + clickableRange &&
        canvas.rectStartY - clickableRange < canvas.mouseMoveY &&
        canvas.mouseMoveY < canvas.rectEndY + clickableRange,
    };
    if (mousePositionFromRect.topLeft) {
      drawingCanvas.value.style.cursor = 'nwse-resize';
    } else if (mousePositionFromRect.topRight) {
      drawingCanvas.value.style.cursor = 'nesw-resize';
    } else if (mousePositionFromRect.bottomRight) {
      drawingCanvas.value.style.cursor = 'nwse-resize';
    } else if (mousePositionFromRect.bottomLeft) {
      drawingCanvas.value.style.cursor = 'nesw-resize';
    } else if (mousePositionFromRect.top) {
      drawingCanvas.value.style.cursor = 'ns-resize';
    } else if (mousePositionFromRect.right) {
      drawingCanvas.value.style.cursor = 'ew-resize';
    } else if (mousePositionFromRect.bottom) {
      drawingCanvas.value.style.cursor = 'ns-resize';
    } else if (mousePositionFromRect.left) {
      drawingCanvas.value.style.cursor = 'ew-resize';
    } else {
      drawingCanvas.value.style.cursor = 'crosshair';
    }
  } else {
    drawingCanvas.value.style.cursor = 'crosshair';
  }
};

const onMouseMoveCanvas = (event: MouseEvent) => {
  if (canvas.isMouseDown) return;

  selectCropArea(event);
  changeCursorStyle();
};

const onMouseUpWindow = () => {
  window.removeEventListener('mousemove', selectCropArea);
  canvas.isMouseDown = false;
  window.removeEventListener('mouseup', onMouseUpWindow);

  saveRectPosition();
};

const saveRectPosition = () => {
  canvas.rectStartX = canvas.tempRectStartX;
  canvas.rectEndX = canvas.tempRectEndX;
  canvas.rectStartY = canvas.tempRectStartY;
  canvas.rectEndY = canvas.tempRectEndY;
};

const cropImage = () => {
  openLoading();

  if (uploadImage.cropSize.width === 0 || uploadImage.cropSize.height === 0)
    return;

  if (displayCanvas.value === undefined) return;
  const base64 = displayCanvas.value.toDataURL(uploadImage.originalFile?.type);
  const image = new Image();

  image.onload = () => {
    if (displayCanvasCtx.value == undefined) return;
    const width = uploadImage.cropSize.width;
    const height = uploadImage.cropSize.height;

    if (displayCanvas.value === undefined) return;
    displayCanvas.value.width = width;
    displayCanvas.value.height = height;

    calculateCanvasRatio();
    saveUploadImageCurrentSize(width, height);
    resizeCanvasContainer(width, height);
    resizeDrawingCanvas(width, height);

    displayCanvasCtx.value.drawImage(
      image,
      canvas.rectStartX,
      canvas.rectStartY,
      width,
      height,
      0,
      0,
      width,
      height
    );

    resetRectPosition();
    closeLoading();
  };

  image.src = base64;
};

const resetCanvasImage = () => {
  resetDrawingCanvas();
  resetRectPosition();
  setCanvasImage();
};

const resetDrawingCanvas = () => {
  if (drawingCanvas.value === undefined) return;
  if (drawingCanvasCtx.value == undefined) return;

  drawingCanvasCtx.value.clearRect(
    0,
    0,
    drawingCanvas.value.width,
    drawingCanvas.value.height
  );
};

const resetRectPosition = () => {
  canvas.tempRectStartX = 0;
  canvas.tempRectStartY = 0;
  canvas.tempRectEndX = 0;
  canvas.tempRectEndY = 0;
  canvas.rectStartX = 0;
  canvas.rectStartY = 0;
  canvas.rectEndX = 0;
  canvas.rectEndY = 0;

  canvas.hasRect = false;
};

const rotateImage = (direction: 'left' | 'right') => {
  openLoading();

  resetDrawingCanvas();

  if (displayCanvas.value === undefined) return;
  const base64 = displayCanvas.value.toDataURL(uploadImage.originalFile?.type);
  const image = new Image();

  image.onload = () => {
    if (displayCanvas.value === undefined) return;
    const width = displayCanvas.value.height;
    const height = displayCanvas.value.width;

    displayCanvas.value.width = width;
    displayCanvas.value.height = height;

    saveUploadImageCurrentSize(width, height);
    resizeCanvasContainer(width, height);
    resizeDrawingCanvas(width, height);

    const degree = direction === 'right' ? 90 : -90;

    if (displayCanvasCtx.value == undefined) return;
    displayCanvasCtx.value.save();
    displayCanvasCtx.value.translate(width / 2, height / 2);
    displayCanvasCtx.value.rotate((degree * Math.PI) / 180);
    displayCanvasCtx.value.translate(-image.width / 2, -image.height / 2);
    displayCanvasCtx.value.drawImage(image, 0, 0);
    displayCanvasCtx.value.restore();

    resetRectPosition();
    closeLoading();
  };

  image.src = base64;
};

watchEffect(() => {
  uploadImage.resize.width = uploadImage.currentSize.width;
});

watchEffect(() => {
  uploadImage.resize.height = uploadImage.currentSize.height;
});

const onChangeResizeWidth = (currentValue: number) => {
  changeResizeSideSize(currentValue, 'width');
};

const onChangeResizeHeight = (currentValue: number) => {
  changeResizeSideSize(currentValue, 'height');
};

const changeResizeSideSize = (
  currentValue: number,
  changedSize: 'width' | 'height'
) => {
  const sideSize = changedSize === 'width' ? 'height' : 'width';
  const ratio = currentValue / uploadImage.currentSize[changedSize];
  uploadImage.resize[sideSize] = Math.round(
    uploadImage.currentSize[sideSize] * ratio
  );
};

const resizeImage = () => {
  if (displayCanvas.value === undefined) return;
  const base64 = displayCanvas.value.toDataURL(uploadImage.originalFile?.type);
  const image = new Image();

  image.onload = () => {
    if (displayCanvasCtx.value == undefined) return;
    const width = uploadImage.resize.width;
    const height = uploadImage.resize.height;

    if (displayCanvas.value === undefined) return;
    displayCanvas.value.width = width;
    displayCanvas.value.height = height;

    calculateCanvasRatio();
    saveUploadImageCurrentSize(width, height);
    resizeCanvasContainer(width, height);
    resizeDrawingCanvas(width, height);

    displayCanvasCtx.value.drawImage(image, 0, 0, width, height);

    resetRectPosition();
    closeLoading();
  };

  image.src = base64;
};

const downloadImage = () => {
  if (displayCanvas.value === undefined) return;
  const base64 = displayCanvas.value.toDataURL(uploadImage.originalFile?.type);
  const blob = Base64toBlob(base64);

  const a = document.createElement('a');
  a.href = window.URL.createObjectURL(blob);
  if (uploadImage.originalFile === undefined) return;
  a.download = uploadImage.originalFile.name;
  a.click();
};

const Base64toBlob = (base64: string) => {
  const tmp = base64.split(',');
  const data = atob(tmp[1]);
  const buffer = new Uint8Array(data.length);
  for (var i = 0; i < data.length; i++) {
    buffer[i] = data.charCodeAt(i);
  }
  const blob = new Blob([buffer], { type: uploadImage.originalFile?.name });
  return blob;
};

const emit = defineEmits<{
  (e: 'returnUploader'): void;
}>();

const returnUploader = () => {
  emit('returnUploader');
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

.image-editor-heading {
  font-weight: 700;
  font-size: 1.8rem;
  .tooltipIcon {
    margin-left: 8px;
  }
}

.image-editor-main {
  .image-editor-heading {
    margin-bottom: 1em;
  }
  > .menu {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  // eslint-disable-next-line vue-scoped-css/no-unused-selector
  > .menu > .el-button + .el-button {
    margin-left: 0; // Element Plus default CSS 打ち消し
  }
  // eslint-disable-next-line vue-scoped-css/no-unused-selector
  > .menu > .el-button:not(:last-of-type) {
    margin-right: 10px;
    margin-bottom: 10px;
  }
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
  .image-editor-heading {
    margin-bottom: 0.5em;
  }
  > .panel-block {
    &:not(:first-of-type) {
      margin-top: 28px;
      padding-top: 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.4);
    }
  }
}
.panel-block {
  > .text {
    margin-bottom: 1em;
    font-size: 1.5rem;
  }
  > .resize-form {
    margin-bottom: 1em;
  }
  > .resizeButton {
    margin-top: 24px;
  }
}

.resize-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  font-size: 1.5rem;
  // eslint-disable-next-line vue-scoped-css/no-unused-selector
  > .content > .el-input,
  // eslint-disable-next-line vue-scoped-css/no-unused-selector
  > .content > .el-input-number {
    margin: 0 4px;
    width: 100px;
  }
}
</style>
