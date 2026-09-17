export const SITE_NAME = '';

export const DEFAULT_DOCUMENT_TITLE =
  'Model Link Portfolio — All in one Portfolio in bio';

export const formatProfileDocumentTitle = (accountName) => {
  const name = String(accountName || '')
    .trim()
    .replace(/^@+/, '');
  const base = name
    ? `${name} - Exclusive Portfolio & Bookings`
    : 'Exclusive Portfolio & Bookings';
  const site = String(SITE_NAME || '').trim();
  return site ? `${base} | ${site}` : base;
};
