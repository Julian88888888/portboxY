export const DISPLAY_SIZE_OPTIONS = [
  { id: 'S', label: 'S', hint: 'Small' },
  { id: 'M', label: 'M', hint: 'Medium' },
  { id: 'L', label: 'L', hint: 'Large' },
];

export const normalizeDisplaySize = (value) =>
  value === 'S' || value === 'L' || value === 'M' ? value : 'M';

/** Portfolio album card span in a 6-column grid */
export const getAlbumCardGridStyle = (size) => {
  const normalized = normalizeDisplaySize(size);
  if (normalized === 'S') {
    return { gridColumn: 'span 2', aspectRatio: '1 / 1' };
  }
  if (normalized === 'L') {
    return { gridColumn: 'span 4', aspectRatio: '4 / 5' };
  }
  return { gridColumn: 'span 3', aspectRatio: '4 / 5' };
};

/** Thumbnail cell in album image grids (12-col feel via auto spans) */
export const getImageThumbGridStyle = (size) => {
  const normalized = normalizeDisplaySize(size);
  if (normalized === 'S') {
    return { gridColumn: 'span 1', aspectRatio: '1 / 1' };
  }
  if (normalized === 'L') {
    return { gridColumn: 'span 2', aspectRatio: '4 / 5' };
  }
  return { gridColumn: 'span 1', aspectRatio: '4 / 5' };
};
