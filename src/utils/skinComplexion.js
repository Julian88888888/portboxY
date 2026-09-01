export const SKIN_COMPLEXION_OPTIONS = [
  { value: 'Pale', label: 'Pale (Light, pale white)' },
  { value: 'Fair', label: 'Fair (white, fair)' },
  { value: 'Medium', label: 'Medium (White to olive)' },
  { value: 'Olive', label: 'Olive (Beige olive, moderate brown)' },
  { value: 'Brown', label: 'Brown (Brown, dark brown)' },
  { value: 'Dark', label: 'Dark (Very dark brown to black)' },
];

export const formatSkinComplexionLabel = (value, fallback = '') => {
  if (value == null || String(value).trim() === '') return fallback;
  const raw = String(value).trim();
  const match = SKIN_COMPLEXION_OPTIONS.find((o) => o.value === raw);
  return match ? match.value : raw;
};
