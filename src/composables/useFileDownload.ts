export const useFileDownload = () => {
  const downloadFile = (urlObject: Blob, downloadName: string) => {
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(urlObject);
    a.download = downloadName;
    a.click();
  };

  return {
    downloadFile,
  };
};
