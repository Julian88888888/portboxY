export const PROFILE_AVAILABLE_FOR_OPTIONS = [
  'Beauty',
  'Commercial',
  'Editorial',
  'Film',
  'Glamour',
  'Print',
];

export const parseAvailableForSelections = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const formatAvailableForSelections = (selections) =>
  (Array.isArray(selections) ? selections : [])
    .map((item) => String(item).trim())
    .filter(Boolean)
    .join(', ');
