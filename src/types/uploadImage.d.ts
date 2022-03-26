import { UploadRawFile } from 'element-plus';

export interface UploadImage {
  originalFile: UploadRawFile | undefined;
  currentSize: {
    width: number;
    height: number;
  };
  cropSize: {
    width: number;
    height: number;
  };
  resize: {
    width: number;
    height: number;
  };
}