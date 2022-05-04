<template>
  <div class="image-menu">
    <h2 class="heading">
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
        @click="cropCanvasImage"
        >選択範囲をトリミング</el-button
      >
      <el-button type="primary" plain @click="rotateCanvasImage('right')"
        >右に90°回転</el-button
      >
      <el-button type="primary" plain @click="rotateCanvasImage('left')"
        >左に90°回転</el-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { QuestionFilled } from '@element-plus/icons-vue';

const props = defineProps<{
  canCrop: boolean;
  cropCanvasImage: () => void;
  rotateCanvasImage: (direction: 'right' | 'left') => void;
}>();
</script>

<style scoped lang="scss">
.image-menu {
  > .heading {
    margin-bottom: 0.5em;
    font-weight: 700;
    font-size: 1.8rem;
    .tooltipIcon {
      margin-left: 8px;
    }
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
}
</style>
