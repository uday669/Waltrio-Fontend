// Standard Currency Metadata & Formatting System for Waltrio

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", symbol: "AU$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "SGD", symbol: "SG$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "AED", symbol: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿" },
];

export const CURRENCY_MAP = CURRENCIES.reduce((acc, curr) => {
  acc[curr.code] = curr;
  return acc;
}, {});

/**
 * Returns currency symbol for a given code (defaults to ₹ if code not found or code is INR)
 */
export function getCurrencySymbol(code = "INR") {
  if (!code) return "₹";
  const upper = String(code).toUpperCase().trim();
  return CURRENCY_MAP[upper]?.symbol || (upper === "INR" ? "₹" : upper === "USD" ? "$" : upper);
}

/**
 * Formats a numeric amount with the user's primary currency
 * @param {number|string} amount
 * @param {string} currencyCode (e.g. 'USD', 'INR', 'EUR')
 * @param {object} options Intl formatting options
 */
export function formatCurrency(amount, currencyCode = "INR", options = {}) {
  const num = Number(amount) || 0;
  const symbol = getCurrencySymbol(currencyCode);
  const decimals = options.minimumFractionDigits ?? 2;
  const formattedNum = num.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  });
  return `${symbol}${formattedNum}`;
}
