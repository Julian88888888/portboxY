export const BODY_TYPE_OPTIONS = [
  { value: 'Rectangle', label: 'Rectangle (Bust ≈ Hips, Waist Minimal, no curves)' },
  { value: 'Pear', label: 'Pear (Hips > Bust, Waist Well-defined)' },
  { value: 'Apple', label: 'Apple (Bust ≥ Hips, Fuller midsection, Waist Soft)' },
  { value: 'Inverted Triangle', label: 'Inverted Triangle (Bust > Hips, Waist Moderate, V-shape)' },
  { value: 'Triangle', label: 'Triangle (Hips > Bust (vastly), Waist Moderate)' },
  { value: 'Spoon', label: 'Spoon (Hips > Bust, Waist Defined, visible hip shelf)' },
  { value: 'Hourglass', label: 'Hourglass (Bust ≈ Hips, Waist Very defined)' },
  { value: 'Top Hourglass', label: 'Top Hourglass (Bust > Hips (slightly), Waist Defined)' },
  { value: 'Bottom Hourglass', label: 'Bottom Hourglass (Hips > Bust (slightly), Waist Defined)' },
  { value: 'Diamond', label: 'Diamond (Midsection widest, Waist Soft)' },
  { value: 'Ectomorph', label: 'Ectomorph (Slender, Flat chest, Long arms/legs)' },
  { value: 'Mesomorph', label: 'Mesomorph (Muscular, Broad shoulders, Narrow waist)' },
  { value: 'Endomorph', label: 'Endomorph (Higher body fat, Wide waist, Shorter limbs)' },
  { value: 'Ecto-Mesomorph', label: 'Ecto-Mesomorph (Narrow waist, broader shoulders, Low body fat)' },
  { value: 'Meso-Endomorph', label: 'Meso-Endomorph (Muscular, thick frame, Round face and midsection)' },
  { value: 'Endo-Ectomorph', label: 'Endo-Ectomorph (Slender, Low muscle mass, High fat-to-muscle ratio)' },
  { value: 'Balanced', label: 'Balanced (Moderate muscle mass, Undefined curves)' },
];

export const formatBodyTypeLabel = (value, fallback = '') => {
  if (value == null || String(value).trim() === '') return fallback;
  const raw = String(value).trim();
  const match = BODY_TYPE_OPTIONS.find((o) => o.value === raw);
  return match ? match.value : raw;
};
