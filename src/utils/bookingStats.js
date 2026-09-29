export const TRAVEL_LIMIT_OPTIONS = [
  { value: 'Local', label: 'Locally (Citywide)' },
  { value: 'Statewide', label: 'Locally (Statewide)' },
  { value: 'Nationwide', label: 'Nation/Country Wide' },
  { value: 'International', label: 'Internationally' },
];

export const TFP_ACCEPTED_OPTIONS = [
  { value: 'No', label: 'No' },
  { value: 'Yes', label: 'Yes' },
];

export const REPRESENTATION_STATUS_OPTIONS = [
  { value: 'Freelance', label: 'Self (Freelance)' },
  { value: 'Agency Exclusive', label: 'Agency (Exclusive)' },
  { value: 'Agency Non-Exclusive', label: 'Agency (Non-Exclusive)' },
];

const labelFromOptions = (options, value) => {
  if (value == null || String(value).trim() === '') return '';
  const raw = String(value).trim();
  const option = options.find((item) => item.value === raw);
  return option ? option.label : raw;
};

export const formatTravelLimitLabel = (value, { compact = true } = {}) => {
  if (value == null || String(value).trim() === '') return '';
  const raw = String(value).trim();
  if (compact) return raw;
  return labelFromOptions(TRAVEL_LIMIT_OPTIONS, raw);
};

export const formatTfpAcceptedLabel = (value) => labelFromOptions(TFP_ACCEPTED_OPTIONS, value);

export const formatRepresentationLabel = (value, { compact = true } = {}) => {
  if (value == null || String(value).trim() === '') return '';
  const raw = String(value).trim();
  if (compact) {
    if (raw === 'Freelance') return 'Freelance';
    if (raw === 'Agency Exclusive') return 'Agency Exclusive';
    if (raw === 'Agency Non-Exclusive') return 'Agency Non-Exclusive';
    return raw;
  }
  return labelFromOptions(REPRESENTATION_STATUS_OPTIONS, raw);
};
