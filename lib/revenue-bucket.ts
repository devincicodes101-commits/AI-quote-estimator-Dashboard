export function classifyRevenueBucket(service: string): string {
  if (!service) return "Residential & Small Commercial"

  if (/Dumpster|Trash Area|Storefront|Recurring|Common Area Pressure|Turf|Solar Panel/i.test(service)) {
    return "Recurring Commercial/HOA"
  }
  if (/Parking Garage|Post-Construction|Warehouse|Trash Chute|Loading Dock|High-Access|Building Washing/i.test(service)) {
    return "High-Ticket Commercial"
  }
  if (/Junk|Eviction|Property Cleanouts/i.test(service)) {
    return "Cleanouts/Junk"
  }
  return "Residential & Small Commercial"
}

export const REVENUE_BUCKETS = [
  "Recurring Commercial/HOA",
  "High-Ticket Commercial",
  "Residential & Small Commercial",
  "Cleanouts/Junk",
] as const

export const MONTHLY_TARGETS: Record<string, { low: number; high: number }> = {
  "Recurring Commercial/HOA": { low: 60000, high: 80000 },
  "High-Ticket Commercial": { low: 50000, high: 70000 },
  "Residential & Small Commercial": { low: 25000, high: 40000 },
  "Cleanouts/Junk": { low: 25000, high: 40000 },
}

export const MONTHLY_REVENUE_TARGET = 166667
