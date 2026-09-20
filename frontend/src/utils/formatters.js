export const DEFAULT_USD_TO_INR = import.meta.env.VITE_USD_TO_INR ? Number(import.meta.env.VITE_USD_TO_INR) : 83.50;

export const convertUSDtoINR = (usdVal, rate = DEFAULT_USD_TO_INR) => {
  if (usdVal === undefined || usdVal === null || isNaN(usdVal)) return 0;
  return usdVal * rate;
};

export const formatINR = (usdVal, decimals = 2, rate = DEFAULT_USD_TO_INR) => {
  if (usdVal === undefined || usdVal === null || isNaN(usdVal)) return '₹0.00';
  const inrVal = usdVal * rate;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(inrVal);
};

// Re-export formatCurrency as formatINR wrapper for full backwards compatibility
export const formatCurrency = (usdVal, decimals = 2, rate = DEFAULT_USD_TO_INR) => {
  return formatINR(usdVal, decimals, rate);
};

export const formatPercent = (val, decimals = 2) => {
  if (val === undefined || val === null || isNaN(val)) return '0.00%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(decimals)}%`;
};

export const formatNumber = (val, decimals = 2) => {
  if (val === undefined || val === null || isNaN(val)) return '0.00';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(val);
};
