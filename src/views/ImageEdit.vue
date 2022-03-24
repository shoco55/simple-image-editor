<template>
  <div class="app-wrapper">
    <TheHeader />
    <div class="app-main">
      <ImageUploader />
      <ImageEditor />
    </div>
  </div>
</template>

<script setup lang="ts">
import TheHeader from '../components/TheHeader.vue';
import ImageUploader from '../components/ImageUploader.vue';
import ImageEditor from '../components/ImageEditor.vue';
</script>

<style scoped lang="scss">
.app-wrapper {
  width: 100%;
  max-width: 1400px;
  min-height: 100vh;
  padding: 40px 48px;
  overflow: scroll;
  @include pre.mq(medium) {
    min-height: auto;
    height: 100%;
    padding: 16px;
  }
  > .app-main {
    padding-top: 10px;
    padding-bottom: 10px;
  }
}
</style>
