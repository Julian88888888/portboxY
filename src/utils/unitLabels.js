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

/** Display height on profile / preview — ft/in vs single-value units. */
export const formatHeightDisplay = (
  heightFeet,
  heightInches,
  heightUnit,
  fallback = "5'11\""
) => {
  const unit =
    heightUnit == null || String(heightUnit).trim() === '' || heightUnit === 'FeetInches'
      ? 'FeetInches'
      : heightUnit;
  const ft = heightFeet != null ? String(heightFeet).trim() : '';
  const inches = heightInches != null ? String(heightInches).trim() : '';

  if (unit === 'FeetInches') {
    if (ft && inches) return `${ft}'${inches}"`;
    if (ft) return `${ft}'`;
    if (inches) return `${inches}"`;
    return fallback;
  }

  if (!ft) return fallback;

  if (unit === 'Centimeters') return `${ft} cm`;
  if (unit === 'Meters') return `${ft}m`;
  if (unit === 'Inches') return `${ft} in`;
  return `${ft} ${formatUnitLabel(unit)}`;
};
