// Parse a "low - high" string like "124 - 248" into [124, 248].
// Falls back to [0, 0] on bad input.
export function parseRange(value: string | undefined | null): [number, number] {
  if (!value) return [0, 0]
  const match = String(value).match(/(-?[0-9]+(?:\.[0-9]+)?)\s*[-–—]\s*(-?[0-9]+(?:\.[0-9]+)?)/)
  if (!match) {
    // Could also just be a single number
    const single = parseFloat(String(value))
    return Number.isFinite(single) ? [single, single] : [0, 0]
  }
  return [parseFloat(match[1]), parseFloat(match[2])]
}

export function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0
  const n = parseFloat(String(value))
  return Number.isFinite(n) ? n : 0
}

export function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  const n = parseFloat(String(value))
  return Number.isFinite(n) ? n : null
}

export function toString(value: unknown): string {
  if (value === null || value === undefined) return ""
  return String(value)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}
