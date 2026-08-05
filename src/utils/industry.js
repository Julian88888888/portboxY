export const INDUSTRY_OPTIONS = [
  { value: 'fashion', label: 'Fashion' },
  { value: 'high-fashion', label: 'High-Fashion' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'glamour', label: 'Glamour' },
  { value: 'art', label: 'Arts' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'adult', label: 'Adult / Explicit' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'promotions', label: 'Promotions' },
  { value: 'digital', label: 'Digital' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'events', label: 'Events' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'sports', label: 'Sports' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'performance', label: 'Performance' },
  { value: 'film', label: 'Film' },
  { value: 'television', label: 'Television' },
];

/** Stored industry value → public display label */
export const formatIndustryLabel = (value, fallback = 'Fashion') => {
  if (value == null || String(value).trim() === '') {
    return fallback;
  }

  const raw = String(value).trim();
  const match = INDUSTRY_OPTIONS.find(
    (opt) => opt.value === raw || opt.value === raw.toLowerCase() || opt.label.toLowerCase() === raw.toLowerCase()
  );
  if (match) return match.label;

  return raw;
};
