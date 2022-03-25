<template>
  <div class="app-wrapper">
    <TheHeader />
    <main class="app-main">
      <ImageUploader
        v-if="activeScreen === 'uploader'"
        @go-to-editor="showEditor" />
      <ImageEditor
        v-else
        :upload-file="uploadFile"
        @return-uploader="showUploader" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UploadFile } from 'element-plus';

import TheHeader from '../components/TheHeader.vue';
import ImageUploader from '../components/ImageUploader.vue';
import ImageEditor from '../components/ImageEditor.vue';

const activeScreen = ref<'uploader' | 'editor'>('uploader');

const uploadFile = ref<UploadFile | undefined>(undefined);

const showEditor = (file: UploadFile) => {
  uploadFile.value = file;
  activeScreen.value = 'editor';
};

const showUploader = () => {
  activeScreen.value = 'uploader';
};
</script>

<style scoped lang="scss">
.app-wrapper {
  margin: 0 auto;
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
