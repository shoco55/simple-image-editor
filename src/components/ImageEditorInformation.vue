<template>
  <div class="image-information">
    <h2 class="heading">編集情報</h2>
    <p class="text">
      現在のサイズ：{{ props.uploadImage.currentSize.width }} ×
      {{ props.uploadImage.currentSize.height }} px
    </p>
    <p class="text">
      選択範囲：
      <template v-if="props.canvas.hasRect"
        >{{ props.uploadImage.cropSize.width }} ×
        {{ props.uploadImage.cropSize.height }} px</template
      >
      <template v-else>未選択</template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { UploadImage } from '../types/uploadImage';
import { CanvasSetting } from '../types/canvasSetting';

const props = defineProps<{
  uploadImage: UploadImage;
  canvas: CanvasSetting;
}>();
</script>

<style scoped lang="scss">
.image-information {
  > .heading {
    margin-bottom: 0.5em;
    font-weight: 700;
    font-size: 1.8rem;
  }
  > .text {
    margin-bottom: 1em;
    font-size: 1.5rem;
  }
}
</style>
