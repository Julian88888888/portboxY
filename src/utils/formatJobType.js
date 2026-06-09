const JOB_TYPE_LABELS = {
  WardrobeStylist: 'Wardrobe Stylist',
  HairStylist: 'Hair Stylist',
  MakeupArtist: 'Makeup Artist',
};

export const formatJobType = (jobType) => JOB_TYPE_LABELS[jobType] || jobType;

export const isModelJobType = (jobType) => {
  const normalized = String(jobType || '').trim().toLowerCase();
  return !normalized || normalized === 'model';
};
