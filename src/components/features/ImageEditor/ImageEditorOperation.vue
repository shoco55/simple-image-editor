<template>
  <div class="image-operations">
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
</template>

<script setup lang="ts">
import { Download, RefreshLeft } from '@element-plus/icons-vue';

const props = defineProps<{
  resetCanvasImage: () => void;
  onClickDownload: () => void;
}>();
</script>

<style scoped lang="scss">
.image-operations {
  // eslint-disable-next-line vue-scoped-css/no-unused-selector
  > .el-button + .el-button {
    margin-left: 0; // Element Plus default CSS 打ち消し
  }
  // eslint-disable-next-line vue-scoped-css/no-unused-selector
  > .el-button:not(:last-of-type) {
    margin-right: 10px;
    @include pre.mq(minimum) {
      margin-top: 10px;
    }
  }
}
</style>
