export const MAX_MARKETS = 3;

export const parseMarkets = (value) =>
  String(value || '')
    .split(',')
    .map((market) => market.trim())
    .filter(Boolean);

export const validateMarkets = (value) => {
  const markets = parseMarkets(value);
  if (markets.length > MAX_MARKETS) {
    return {
      valid: false,
      error: `Maximum ${MAX_MARKETS} markets allowed`,
    };
  }
  return { valid: true, markets };
};
