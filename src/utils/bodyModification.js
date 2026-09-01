/** Body modification options for Personal Stats (multi-select) */
export const BODY_MODIFICATION_OPTIONS = [
  { id: 'tattoo-small', name: 'Tattoo (Small)' },
  { id: 'tattoo-medium', name: 'Tattoo (Medium)' },
  { id: 'tattoo-large', name: 'Tattoo (Large)' },
  { id: 'tattoo-sleeve', name: 'Tattoo (Full Sleeve)' },
  { id: 'tattoo-multiple', name: 'Tattoo (Multiple)' },
  { id: 'ear-piercing', name: 'Ear Piercing' },
  { id: 'nose-piercing', name: 'Nose Piercing' },
  { id: 'lip-piercing', name: 'Lip Piercing' },
  { id: 'eyebrow-piercing', name: 'Eyebrow Piercing' },
  { id: 'tongue-piercing', name: 'Tongue Piercing' },
  { id: 'naval-piercing', name: 'Naval Piercing' },
  { id: 'septum-piercing', name: 'Septum Piercing' },
  { id: 'multiple-piercings', name: 'Multiple Piercings' },
  { id: 'scars', name: 'Scar(s)' },
  { id: 'birthmarks', name: 'Birthmark(s)' },
  { id: 'stretch-marks', name: 'Stretch Marks' },
  { id: 'freckles', name: 'Freckles' },
  { id: 'braces', name: 'Braces' },
  { id: 'dental-work', name: 'Dental Work' },
  { id: 'vitiligo', name: 'Vitiligo' },
  { id: 'skin-condition', name: 'Skin Condition' },
  { id: 'hair-extensions', name: 'Hair Extensions' },
  { id: 'wigs', name: 'Wigs' },
  { id: 'glasses', name: 'Glasses' },
  { id: 'contacts', name: 'Contacts' },
  { id: 'limb-difference', name: 'Limb Difference' },
  { id: 'mobility-aid', name: 'Mobility Aid' },
];

export const normalizeBodyModificationValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

export const formatBodyModificationDisplay = (value, fallback = '') => {
  const tokens = normalizeBodyModificationValue(value);
  if (!tokens.length) return fallback;
  return tokens
    .map((token) => {
      const byId = BODY_MODIFICATION_OPTIONS.find((o) => o.id === token);
      if (byId) return byId.name;
      const byName = BODY_MODIFICATION_OPTIONS.find(
        (o) => o.name.toLowerCase() === token.toLowerCase()
      );
      return byName ? byName.name : token;
    })
    .join(', ');
};
