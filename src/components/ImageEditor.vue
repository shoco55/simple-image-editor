<template>
  <div class="image-editor">
    <div class="image-editor-layout">
      <div class="image-editor-preview">
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
          <canvas class="display" />
          <canvas ref="drawingCanvas" class="drawing" />
        </div>
        <div class="operations">
          <el-button class="resetButton" plain :icon="RefreshLeft"
            >リセット</el-button
          >
          <el-button type="primary" :icon="Download"
            >編集した画像をダウンロード</el-button
          >
        </div>
        <el-button class="returnButton" type="text" plain :icon="Back"
          >画像を選択し直す</el-button
        >
      </div>
      <div class="image-editor-panel">
        <div class="panel-block">
          <h2 class="image-editor-heading">編集情報</h2>
          <p class="text">現在のサイズ：500 × 500 px</p>
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
import {
  QuestionFilled,
  Download,
  RefreshLeft,
  Back,
} from '@element-plus/icons-vue';
</script>

<style scoped lang="scss">
.image-editor-layout {
  display: flex;
  justify-content: space-between;
  @include pre.mq(medium) {
    flex-direction: column;
    justify-content: flex-start;
  }
  > .image-editor-preview {
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

.image-editor-preview {
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
