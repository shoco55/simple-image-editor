<template>
  <div class="image-information">
    <h2 class="heading">編集情報</h2>
    <p class="text">
      現在のサイズ：{{ props.imageSize.current.width }} ×
      {{ props.imageSize.current.height }} px
    </p>
    <p class="text">
      選択範囲：
      <template v-if="props.canvasState.hasRect"
        >{{ props.imageSize.crop.width }} ×
        {{ props.imageSize.crop.height }} px</template
      >
      <template v-else>未選択</template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ImageSize } from '@/types/ImageSize';
import { CanvasState } from '@/types/canvas';

const props = defineProps<{
  imageSize: ImageSize;
  canvasState: CanvasState;
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
