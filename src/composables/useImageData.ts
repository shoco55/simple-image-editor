import { reactive, watchEffect, computed } from 'vue';

import { UploadFile, ImageData, ImageSize } from '@/types/image';

export const useImageData = () => {
  const imageData: ImageData = reactive({
    originalImageFile: undefined,
  });

  const updateOriginalImageFile = (file: UploadFile) => {
    imageData.originalImageFile = file;
  };

  const imageSize: ImageSize = reactive({
    current: {
      width: 0,
      height: 0,
    },
    crop: {
      width: 0,
      height: 0,
    },
    resize: {
      width: 0,
      height: 0,
    },
  });

  const canCrop = computed(() => {
    return imageSize.crop.width > 0 && imageSize.crop.height > 0;
  });

  const updateImageCurrentSize = (width: number, height: number) => {
    imageSize.current.width = width;
    imageSize.current.height = height;
  };

  const updateImageCropSize = (width: number, height: number) => {
    imageSize.crop.width = width;
    imageSize.crop.height = height;
  };

  const updateImageResize = (width: number, height: number) => {
    imageSize.resize.width = width;
    imageSize.resize.height = height;
  };

  watchEffect(() => {
    updateImageResize(imageSize.current.width, imageSize.current.height);
  });

  return {
    imageData,
    updateOriginalImageFile,
    imageSize,
    canCrop,
    updateImageCurrentSize,
    updateImageCropSize,
    updateImageResize,
  };
};
