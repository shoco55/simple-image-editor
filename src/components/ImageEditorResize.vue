<template>
  <div class="image-resize">
    <h2 class="heading">
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
          v-model="resize.width"
          :min="1"
          :max="props.uploadImage.currentSize.width"
          controls-position="right"
          @change="onChangeResizeWidth" />
        <span>×</span>
        <el-input-number
          v-model="resize.height"
          :min="1"
          :max="props.uploadImage.currentSize.height"
          controls-position="right"
          @change="onChangeResizeHeight" />
        <span>px</span>
      </div>
    </div>
    <div class="resizeButton">
      <el-button type="primary" plain @click="resizeCanvasImage"
        >新規サイズに変更</el-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watchEffect } from 'vue';
import { QuestionFilled } from '@element-plus/icons-vue';

import { UploadImage } from '../types/uploadImage';

const props = defineProps<{
  uploadImage: UploadImage;
}>();

const emit = defineEmits<{
  (e: 'setImageResize', width: number, height: number): void;
  (e: 'resizeCanvasImage'): void;
}>();

const resize: {
  width: number;
  height: number;
} = reactive({
  width: 0,
  height: 0,
});

watchEffect(() => {
  resize.width = props.uploadImage.resize.width;
  resize.height = props.uploadImage.resize.height;
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
  const ratio = currentValue / props.uploadImage.currentSize[changedSize];
  resize[sideSize] = Math.round(
    props.uploadImage.currentSize[sideSize] * ratio
  );

  emit('setImageResize', resize.width, resize.height);
};

const resizeCanvasImage = () => {
  emit('resizeCanvasImage');
};
</script>

<style scoped lang="scss">
.image-resize {
  > .heading {
    margin-bottom: 0.5em;
    font-weight: 700;
    font-size: 1.8rem;
    .tooltipIcon {
      margin-left: 8px;
    }
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
