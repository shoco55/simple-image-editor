<template>
  <div v-loading="isLoading" style="width: 100%" class="image-editor">
    <div class="image-editor-layout">
      <div class="image-editor-main">
        <h2 class="image-editor-heading">
          編集メニュー
          <el-tooltip
            content="画像をトリミングするには、画像上をクリックしてからドラッグで範囲を選択して、<br>「選択範囲をトリミング」ボタンを押下してください。<br>選択範囲のサイズは「編集情報」で確認できます。"
            raw-content
            placement="bottom-start">
            <el-button class="tooltipIcon" :icon="QuestionFilled" circle />
          </el-tooltip>
        </h2>
        <div class="menu">
          <el-button type="primary" plain>選択範囲をトリミング</el-button>
          <el-button type="primary" plain>右に90°回転</el-button>
          <el-button type="primary" plain>左に90°回転</el-button>
        </div>
        <div class="image-canvas">
          <div ref="canvasContainer" class="image-canvas">
            <canvas ref="displayCanvas" class="display" />
            <canvas ref="drawingCanvas" class="drawing" />
          </div>
        </div>
        <div class="operations">
          <el-button class="resetButton" plain :icon="RefreshLeft"
            >リセット</el-button
          >
          <el-button type="primary" :icon="Download"
            >編集した画像をダウンロード</el-button
          >
        </div>
        <el-button
          class="returnButton"
          type="text"
          plain
          :icon="Back"
          @click="returnUploader"
          >画像を選択し直す</el-button
        >
      </div>
      <div class="image-editor-panel">
        <div class="panel-block">
          <h2 class="image-editor-heading">編集情報</h2>
          <p class="text">
            現在のサイズ：{{ uploadImage.currentSize.width }} ×
            {{ uploadImage.currentSize.height }} px
          </p>
          <p class="text">選択範囲：230 × 230 px</p>
        </div>
        <div class="panel-block">
          <h2 class="image-editor-heading">
            リサイズ
            <el-tooltip
              content="元の画像のサイズ比率を保ったまま、サイズを変更できます。<br>現在のサイズより拡大することはできません。<br><br>トリミング範囲選択中にリサイズすると、選択範囲が解除されます。<br>トリミング後に縮尺の変更を行いたい場合は、<br>範囲選択後に「選択範囲をトリミング」を押下してから、<br>リサイズを行って下さい。"
              raw-content
              placement="bottom-start">
              <el-button class="tooltipIcon" :icon="QuestionFilled" circle />
            </el-tooltip>
          </h2>
          <div class="resize-form">
            <span class="label">新規サイズ：</span>
            <div class="content">
              <el-input-number controls-position="right" />
              <span>×</span>
              <el-input-number controls-position="right" />
              <span>px</span>
            </div>
          </div>
          <div class="resizeButton">
            <el-button type="primary" plain>新規サイズに変更</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
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
}

interface CanvasSetting {
  displayReductionRatio: number;
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
});

const canvas: CanvasSetting = reactive({
  displayReductionRatio: 1,
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

const emit = defineEmits<{
  (e: 'returnUploader'): void;
}>();

const returnUploader = () => {
  emit('returnUploader');
};
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
    height: 100%;
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
    margin-bottom: 30px;
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
    margin-top: 2em;
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
    margin-top: 2em;
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
