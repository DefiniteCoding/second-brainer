export const uploadFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  return file.size <= maxSize;
};

export const validateImageType = (file: File): boolean => {
  return file.type.startsWith('image/');
};

export const validateAudioType = (file: File): boolean => {
  return file.type.startsWith('audio/');
}; 