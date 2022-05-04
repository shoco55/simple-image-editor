export const useBase64toBlob = () => {
  const convertBase64toBlob = (base64: string, fileName: string) => {
    const tmp = base64.split(',');
    const data = atob(tmp[1]);
    const buffer = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      buffer[i] = data.charCodeAt(i);
    }
    const blob = new Blob([buffer], {
      type: fileName,
    });

    return blob;
  };

  return {
    convertBase64toBlob,
  };
};
