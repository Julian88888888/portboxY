export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
export const MAX_IMAGE_SIZE_MB = 2;
export const MAX_IMAGE_SIZE_HINT = 'Max 2 MB per image';

export const getImageSizeError = () =>
  `Image must be ${MAX_IMAGE_SIZE_MB} MB or smaller`;

export const validateImageFileSize = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: getImageSizeError() };
  }
  return { valid: true, error: null };
};
