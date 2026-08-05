/** Map stored unit values to short display labels */
const UNIT_SHORT_LABELS = {
  Pounds: 'lbs',
  Kilograms: 'kg',
  Grams: 'g',
  Centimeters: 'cm',
  Inches: 'in',
  Meters: 'm',
  Millimeters: 'mm',
  FeetInches: 'in',
};

export const formatUnitLabel = (unit, fallback = '') => {
  if (unit == null || String(unit).trim() === '') return fallback;
  const raw = String(unit).trim();
  return UNIT_SHORT_LABELS[raw] || raw;
};
