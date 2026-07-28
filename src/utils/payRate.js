import { PAY_CURRENCIES } from './currencies';

export const PAY_RATE_TYPES = [
  { value: 'flat-rate', label: 'Flat Rate' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'half-day', label: 'Half Day' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annually', label: 'Annual Salary' },
  { value: 'per-task', label: 'Per Task' },
];

/** Build stored/display pay rate: "100 USD Flat Rate" */
export const formatPayRate = (offerAmount, payCurrency, payRate) => {
  const amount = String(offerAmount || '').trim();
  const currency = PAY_CURRENCIES.find((c) => c.value === payCurrency);
  const rateType = PAY_RATE_TYPES.find((r) => r.value === payRate);
  if (!amount || !currency || !rateType) return '';
  return `${amount} ${currency.value} ${rateType.label}`;
};

const SYMBOL_TO_CURRENCY = (() => {
  const map = {};
  PAY_CURRENCIES.forEach((c) => {
    if (c.symbol && !map[c.symbol]) map[c.symbol] = c.value;
  });
  // Prefer USD for plain $
  map['$'] = 'USD';
  return map;
})();

const LEGACY_RATE_ALIASES = {
  'flat rate': 'Flat Rate',
  flat: 'Flat Rate',
  hourly: 'Hourly',
  'per hour': 'Hourly',
  '/hr': 'Hourly',
  'half day': 'Half Day',
  daily: 'Daily',
  'per day': 'Daily',
  weekly: 'Weekly',
  biweekly: 'Biweekly',
  monthly: 'Monthly',
  annually: 'Annual Salary',
  'annual salary': 'Annual Salary',
  'per task': 'Per Task',
};

/**
 * Normalize any stored pay_rate string for booking UI.
 * Preferred: "100 USD Flat Rate"
 */
export const formatPayRateDisplay = (payRate) => {
  const raw = String(payRate || '').trim();
  if (!raw) return '';

  // Already new format: "100 USD Flat Rate"
  const newFormat = raw.match(/^(\d+(?:[.,]\d+)?)\s+([A-Z]{3})\s+(.+)$/i);
  if (newFormat) {
    const amount = newFormat[1].replace(',', '.');
    const code = newFormat[2].toUpperCase();
    const typeRaw = newFormat[3].trim();
    const type =
      PAY_RATE_TYPES.find((t) => t.label.toLowerCase() === typeRaw.toLowerCase())?.label ||
      LEGACY_RATE_ALIASES[typeRaw.toLowerCase()] ||
      typeRaw;
    return `${amount} ${code} ${type}`;
  }

  // Legacy: "$100 · Flat Rate" or "$100 - Flat Rate"
  const symbolFormat = raw.match(/^([^\d\s]+)\s*(\d+(?:[.,]\d+)?)\s*[·\-–—]?\s*(.+)$/);
  if (symbolFormat) {
    const symbol = symbolFormat[1].trim();
    const amount = symbolFormat[2].replace(',', '.');
    const typeRaw = symbolFormat[3].replace(/^[·\-–—]\s*/, '').trim();
    const code = SYMBOL_TO_CURRENCY[symbol] || 'USD';
    const type =
      PAY_RATE_TYPES.find((t) => t.label.toLowerCase() === typeRaw.toLowerCase())?.label ||
      LEGACY_RATE_ALIASES[typeRaw.toLowerCase()] ||
      typeRaw;
    return `${amount} ${code} ${type}`;
  }

  // Legacy: "$50 per hour"
  const perHour = raw.match(/^([^\d\s]+)?\s*(\d+(?:[.,]\d+)?)\s+per\s+hour$/i);
  if (perHour) {
    const symbol = (perHour[1] || '$').trim();
    const amount = perHour[2].replace(',', '.');
    const code = SYMBOL_TO_CURRENCY[symbol] || 'USD';
    return `${amount} ${code} Hourly`;
  }

  return raw;
};
