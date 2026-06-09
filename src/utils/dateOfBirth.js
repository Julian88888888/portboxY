const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isIsoDate = (value) => ISO_DATE_RE.test(String(value || '').trim());

export const normalizeDobForInput = (value) => (isIsoDate(value) ? value : '');

export const calculateAgeFromDob = (dob) => {
  if (!isIsoDate(dob)) return null;
  const birth = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
};

export const getDisplayAge = (value, fallback = '26') => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return fallback;
  if (isIsoDate(trimmed)) {
    const age = calculateAgeFromDob(trimmed);
    return age !== null ? String(age) : fallback;
  }
  return trimmed;
};

export const getMaxDobForInput = () => new Date().toISOString().split('T')[0];
