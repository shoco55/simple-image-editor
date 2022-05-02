import { UploadRawFile } from 'element-plus';

export type UploadFile = UploadRawFile | undefined;

export interface ImageData {
  originalImageFile: UploadFile;
}

type Size = {
  width: number;
  height: number;
};

export interface ImageSize {
  current: Size;
  crop: Size;
  resize: Size;
}
