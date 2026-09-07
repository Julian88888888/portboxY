export const EYE_COLOR_OPTIONS = [
  { value: 'Brown', label: 'Brown (Dark Brown, Honey Brown, Chocolate Brown)' },
  { value: 'Blue', label: 'Blue (Sky Blue, Ice Blue, Ocean Blue)' },
  { value: 'Green', label: 'Green (Olive Green, Emerald Green, Sea Green)' },
  { value: 'Hazel', label: 'Hazel (Brown Hazel, Green Hazel, Golden Hazel)' },
  { value: 'Gray', label: 'Gray (Silver Gray, Steel Gray, Blue Gray)' },
  { value: 'Rare', label: 'Rare (Amber, Copper, Violet, Red)' },
  { value: 'Mixed', label: 'Mixed (Blue Green, Brown Green, Heterochromia)' },
];

export const formatEyeColorLabel = (value, fallback = '') => {
  if (value == null || String(value).trim() === '') return fallback;
  const raw = String(value).trim();
  const match = EYE_COLOR_OPTIONS.find((o) => o.value === raw);
  return match ? match.value : raw;
};
