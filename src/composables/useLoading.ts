import { ref } from 'vue';

export const useLoading = () => {
  const isLoading = ref(true);

  const openLoading = () => {
    isLoading.value = true;
  };

  const closeLoading = () => {
    isLoading.value = false;
  };

  return {
    isLoading,
    openLoading,
    closeLoading,
  };
};
