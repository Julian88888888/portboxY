import { PROFILE_JOB_TYPE_LABELS } from './profileJobTypes';

const LEGACY_JOB_TYPE_LABELS = {
  'Wardrobe Stylist': 'Wardrobe Stylist',
  'Hair Stylist': 'Hair Stylist',
  'Makeup Artist': 'Makeup Artist',
  'Casting Director': 'Casting Director',
  'Editor/Publicist': 'Editor/Publicist',
};

export const formatJobType = (jobType) => {
  if (jobType == null || String(jobType).trim() === '') return jobType;
  const raw = String(jobType).trim();
  return PROFILE_JOB_TYPE_LABELS[raw] || LEGACY_JOB_TYPE_LABELS[raw] || raw;
};

export const isModelJobType = (jobType) => {
  const normalized = String(jobType || '').trim().toLowerCase();
  return !normalized || normalized === 'model';
};
