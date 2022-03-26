import { ElMessage } from 'element-plus';

export const useMessage = () => {
  const showMessage = (
    type: 'success' | 'warning' | 'info' | 'error',
    message: string,
    showClose: boolean
  ) => {
    ElMessage({
      type,
      message,
      showClose,
    });
  };

  return {
    showMessage,
  };
};
