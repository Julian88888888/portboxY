/** Stored ethnicity values → public display labels */
export const ETHNICITY_DISPLAY_LABELS = {
  black: 'Black',
  white: 'White',
  hispanic: 'Hispanic',
  'middle eastern': 'MENA',
  'asian-northeast': 'Northeast Asian',
  'asian-southeast': 'Southeast Asian',
  'asian-central': 'Central Asian',
  'asian-south': 'South Asian',
  'asian-southwest': 'SWANA',
  'pacific islander': 'NHPI',
  'asian-american': 'AAPI',
  'native american': 'Native American',
  'indigenous-arctic': 'Arctic',
  'indigenous-other': 'Indigenous Peoples',
  multiracial: 'Multiracial',
};

/**
 * Format a stored ethnicity value for UI (preview / public page).
 * Falls back to title-casing unknown values (no hyphens).
 */
export const formatEthnicityLabel = (value, fallback = 'White') => {
  if (value == null || String(value).trim() === '') {
    return fallback;
  }

  const raw = String(value).trim();
  const key = raw.toLowerCase();

  if (ETHNICITY_DISPLAY_LABELS[key]) {
    return ETHNICITY_DISPLAY_LABELS[key];
  }

  // Already a nice label (legacy data)
  if (/[A-Z]/.test(raw) && !raw.includes('-')) {
    return raw;
  }

  return raw
    .replace(/[-_]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
