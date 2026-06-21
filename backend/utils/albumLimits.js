const MAX_ALBUMS_PER_USER = 6;
const MAX_IMAGES_PER_ALBUM = 20;

const getMaxAlbumsError = () => `Maximum ${MAX_ALBUMS_PER_USER} albums allowed`;
const getMaxImagesError = () => `Maximum ${MAX_IMAGES_PER_ALBUM} images per album`;

module.exports = {
  MAX_ALBUMS_PER_USER,
  MAX_IMAGES_PER_ALBUM,
  getMaxAlbumsError,
  getMaxImagesError,
};
