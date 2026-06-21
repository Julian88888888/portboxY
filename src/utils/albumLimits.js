export const MAX_ALBUMS_PER_USER = 6;
export const MAX_IMAGES_PER_ALBUM = 20;
export const STARTER_ALBUM_COUNT = 2;

export const STARTER_ALBUMS = [
  { title: 'Fashion', description: 'High Fashion Portfolio Work' },
  { title: 'Portfolio', description: 'Add album description' },
];

export const getMaxAlbumsError = () =>
  `Maximum ${MAX_ALBUMS_PER_USER} albums allowed`;

export const getMaxImagesError = () =>
  `Maximum ${MAX_IMAGES_PER_ALBUM} images per album`;
