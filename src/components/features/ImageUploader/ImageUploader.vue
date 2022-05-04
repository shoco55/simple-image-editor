<template>
  <div class="image-upload">
    <el-upload
      ref="uploadFile"
      class="upload-demo"
      drag
      action="#"
      :auto-upload="false"
      :show-file-list="false"
      :limit="1"
      :on-exceed="handleExceed"
      :on-change="handleChange"
      :before-upload="handleError">
      <el-icon class="el-icon--upload"><upload /></el-icon>
      <div class="el-upload__text">
        ファイルをドロップ または <em>ファイルを選択</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          <p>※対応ファイル形式：jpg/jpeg, png</p>
          <p>※画像はサーバーには保存されません。</p>
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UploadFile } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';

import { useMessage } from '@/composables/useMessage';

const { showMessage } = useMessage();

const emit = defineEmits<{
  (e: 'goToEditor', file: UploadFile): void;
}>();

const uploadFile = ref();

const handleExceed = (files: File[]) => {
  if (files.length > 1) {
    showMessage('warning', '選択できるファイル数は1個です。', true);
  } else {
    uploadFile.value.clearFiles();
    uploadFile.value.handleStart(files[0]);
  }
};

const handleChange = (file: UploadFile) => {
  const fileType = file.raw?.type;
  if (fileType === 'image/jpeg' || fileType === 'image/png') {
    goToEditor(file);
  } else {
    uploadFile.value.clearFiles();
    showMessage(
      'warning',
      '画像のアップロードは「jpg/jpeg, png」形式に対応しています。',
      true
    );
  }
};

const goToEditor = (file: UploadFile) => {
  emit('goToEditor', file);
};

const handleError = () => {
  showMessage(
    'error',
    'エラーが発生しました。しばらく経ってから、もう一度お試しください。',
    true
  );
};
</script>

<style scoped lang="scss"></style>
