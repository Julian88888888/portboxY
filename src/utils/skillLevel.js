export const SKILL_LEVEL_OPTIONS = [
  {
    value: 'Basics',
    label: 'Basic Knowledge (Familiar; no practical experience)',
    displayLabel: 'Basic Knowledge',
  },
  {
    value: 'Amateur',
    label: 'Amateur (Limited experience; simple tasks with guidance)',
    displayLabel: 'Amateur',
  },
  {
    value: 'Semi-Professional',
    label: 'Semi-Professional (Practical experience; can work independently)',
    displayLabel: 'Semi-Professional',
  },
  {
    value: 'Professional',
    label: 'Professional (Strong skill set; can handle complex jobs)',
    displayLabel: 'Professional',
  },
  {
    value: 'Expert',
    label: 'Expert (Full mastery; recognized authority or instructor)',
    displayLabel: 'Expert',
  },
];

export const formatSkillLevelLabel = (value, { compact = true } = {}) => {
  if (value == null || String(value).trim() === '') return '';
  const raw = String(value).trim();
  const option = SKILL_LEVEL_OPTIONS.find((item) => item.value === raw);
  if (!option) return raw;
  return compact ? option.displayLabel : option.label;
};
