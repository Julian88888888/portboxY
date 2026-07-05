export const ALBUM_PLACEHOLDER = '/images/album-placeholder.png';

export const getAlbumCoverSrc = (coverImageUrl, normalizeImageUrl) => {
  if (!coverImageUrl) {
    return ALBUM_PLACEHOLDER;
  }
  return normalizeImageUrl(coverImageUrl) || ALBUM_PLACEHOLDER;
};
