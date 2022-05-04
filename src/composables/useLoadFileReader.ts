export const useLoadFileReader = () => {
  const loadFileReader = (blob: Blob) => {
    return new Promise<string | ArrayBuffer | undefined | null>(
      (resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = (event) => resolve(event.target?.result);
        fileReader.onerror = (error) => reject(error);
        fileReader.readAsDataURL(blob);
      }
    );
  };

  return {
    loadFileReader,
  };
};
