/**
 * Format integer cents into a localized currency string without float drift.
 */
export function formatCents(cents: number, currency = "USD"): string {
  const safeCents = Math.round(cents);
  const negative = safeCents < 0;
  const absCents = Math.abs(safeCents);
  const major = Math.floor(absCents / 100);
  const minor = absCents % 100;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Construct exact decimal value from integer major/minor parts
  const formatted = formatter.format(Number(`${major}.${String(minor).padStart(2, "0")}`));
  return negative ? `-${formatted}` : formatted;
}

/**
 * Format integer cents with an explicit '+' or '-' sign for semantic balance clarity.
 */
export function formatSignedCents(cents: number, currency = "USD"): string {
  if (cents === 0) {
    return formatCents(0, currency);
  }
  if (cents > 0) {
    return `+${formatCents(cents, currency)}`;
  }
  return formatCents(cents, currency);
}

/**
 * Parse a decimal currency string (e.g. "42.50") into integer cents without float rounding bugs.
 * Returns null if the input is invalid or empty.
 */
export function parseCurrencyInputToCents(raw: string): number | null {
  const cleaned = raw.trim().replace(/,/g, "");
  if (!cleaned) return null;
  const match = /^(\d+)(?:\.(\d{0,2}))?$/.exec(cleaned);
  if (!match) return null;

  const whole = Number.parseInt(match[1], 10);
  const fracRaw = match[2] ?? "";
  const frac = Number.parseInt(fracRaw.padEnd(2, "0"), 10);
  return whole * 100 + frac;
}

/**
 * Format an ISO timestamp into a concise readable date.
 */
export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}
