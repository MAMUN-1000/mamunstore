/**
 * Currency conversion and formatting utilities for Bangladeshi (BDT ৳) and International (USD $) users.
 * Standard Conversion Peg: 1 USD = 120 BDT
 */
export const USD_TO_BDT_RATE = 120;

/**
 * Formats a USD numeric amount into Bangladeshi Taka (BDT)
 * e.g. 89.99 -> "৳10,799"
 */
export const formatBDT = (usdAmount = 0) => {
  const bdt = Math.round(usdAmount * USD_TO_BDT_RATE);
  return `৳${bdt.toLocaleString('en-IN')}`;
};

/**
 * Formats a USD numeric amount
 * e.g. 89.99 -> "$89.99"
 */
export const formatUSD = (usdAmount = 0) => {
  return `$${usdAmount.toFixed(2)}`;
};

/**
 * Dual display formatting: Shows BDT with USD in parentheses
 * e.g. "৳10,800 ($89.99)"
 */
export const formatDualPrice = (usdAmount = 0) => {
  return `${formatBDT(usdAmount)} (${formatUSD(usdAmount)})`;
};
