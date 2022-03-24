<template>
  <div class="image-upload">
    <el-upload
      ref="upload"
      class="upload-demo"
      drag
      action="#"
      :auto-upload="false"
      :show-file-list="false">
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
import { Upload } from '@element-plus/icons-vue';
</script>

<style scoped lang="scss"></style>
