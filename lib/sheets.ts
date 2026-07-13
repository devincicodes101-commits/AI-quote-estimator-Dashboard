import { google } from "googleapis"
import type { Lead, Metrics } from "./types"
import { classifyRevenueBucket, REVENUE_BUCKETS } from "./revenue-bucket"
import { parseRange, toNumber, toNullableNumber, toString } from "./parsers"

const SHEET_ID = process.env.GOOGLE_SHEET_ID || ""
const SHEET_TAB = process.env.GOOGLE_SHEET_TAB || "Dashboard Template"

function getAuth() {
  // Preferred: a single JSON blob (no paste corruption risk)
  const credsJson = process.env.GOOGLE_CREDENTIALS_JSON?.trim()
  if (credsJson) {
    let creds: { client_email?: string; private_key?: string }
    try {
      creds = JSON.parse(credsJson)
    } catch (err) {
      throw new Error(
        `GOOGLE_CREDENTIALS_JSON is set but is not valid JSON: ${err instanceof Error ? err.message : String(err)}`
      )
    }
    const email = creds.client_email?.trim()
    const key = creds.private_key?.replace(/\\n/g, "\n")
    if (!email || !key) {
      throw new Error("GOOGLE_CREDENTIALS_JSON is missing client_email or private_key")
    }
    return new google.auth.JWT({
      email,
      key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })
  }

  // Fallback: separate env vars (whitespace trimmed to avoid "account not found")
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim()
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  if (!email || !key) {
    throw new Error(
      "Missing credentials: set either GOOGLE_CREDENTIALS_JSON, or both GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY"
    )
  }
  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  })
}

export async function fetchLeads(): Promise<Lead[]> {
  if (!SHEET_ID) {
    console.warn("GOOGLE_SHEET_ID is not set — returning empty leads")
    return []
  }

  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A1:AZ2000`,
  })

  const rows = res.data.values || []
  if (rows.length < 2) return []

  const headers = rows[0].map((h) => String(h || "").trim())
  const headerIndex = (name: string) => headers.indexOf(name)

  const idx = {
    leadId: headerIndex("Lead ID"),
    date: headerIndex("Date"),
    customerName: headerIndex("Customer Name"),
    customerEmail: headerIndex("Customer Email"),
    customerPhone: headerIndex("Customer Phone"),
    leadSource: headerIndex("Lead Source"),
    zip: headerIndex("ZIP"),
    service: headerIndex("Service"),
    mode: headerIndex("Mode"),
    propertyType: headerIndex("Property Type"),
    quantity: headerIndex("Quantity"),
    estimateLow: headerIndex("Estimate Low"),
    estimateHigh: headerIndex("Estimate High"),
    confidence: headerIndex("Confidence"),
    reviewFlag: headerIndex("Review Flag"),
    subPayout: headerIndex("Sub Payout"),
    companyGross: headerIndex("Company Gross"),
    passThroughCosts: headerIndex("Pass-through Costs"),
    photosUploaded: headerIndex("Photos Uploaded"),
    wonLostPending: headerIndex("Won/Lost/Pending"),
    finalPrice: headerIndex("Final Price"),
    lostReason: headerIndex("Lost Reason"),
    upsellsAccepted: headerIndex("Upsells Accepted"),
    recurringOpportunity: headerIndex("Recurring Opportunity"),
    notes: headerIndex("Notes"),
    strategicAccount: headerIndex("Strategic Account"),
    rangeMath: headerIndex("Range Math"),
    passThroughCoveredBy: headerIndex("Pass-through Covered By"),
    passThroughType: headerIndex("Pass-through Type"),
    actualJobDifficulty: headerIndex("Actual Job Difficulty"),
    cleaningPhase: headerIndex("Cleaning Phase"),
    debrisLevel: headerIndex("Debris Level"),
    estimateMode: headerIndex("Estimate Mode"),
  }

  const leads: Lead[] = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const leadId = toString(row[idx.leadId])
    if (!leadId) continue
    const [subLow, subHigh] = parseRange(toString(row[idx.subPayout]))
    const [grossLow, grossHigh] = parseRange(toString(row[idx.companyGross]))
    leads.push({
      leadId,
      date: toString(row[idx.date]),
      customerName: toString(row[idx.customerName]),
      customerEmail: toString(row[idx.customerEmail]),
      customerPhone: toString(row[idx.customerPhone]),
      leadSource: toString(row[idx.leadSource]),
      zip: toString(row[idx.zip]),
      service: toString(row[idx.service]),
      mode: toString(row[idx.mode]),
      propertyType: toString(row[idx.propertyType]),
      quantity: toNumber(row[idx.quantity]),
      estimateLow: toNumber(row[idx.estimateLow]),
      estimateHigh: toNumber(row[idx.estimateHigh]),
      confidence: toString(row[idx.confidence]),
      reviewFlag: toString(row[idx.reviewFlag]),
      subPayoutLow: subLow,
      subPayoutHigh: subHigh,
      companyGrossLow: grossLow,
      companyGrossHigh: grossHigh,
      passThroughCosts: toNumber(row[idx.passThroughCosts]),
      photosUploaded: toString(row[idx.photosUploaded]),
      wonLostPending: toString(row[idx.wonLostPending]) || "Pending",
      finalPrice: toNullableNumber(row[idx.finalPrice]),
      lostReason: toString(row[idx.lostReason]),
      upsellsAccepted: toString(row[idx.upsellsAccepted]),
      recurringOpportunity: toString(row[idx.recurringOpportunity]),
      notes: toString(row[idx.notes]),
      strategicAccount: toString(row[idx.strategicAccount]),
      rangeMath: toString(row[idx.rangeMath]),
      passThroughCoveredBy: toString(row[idx.passThroughCoveredBy]),
      passThroughType: toString(row[idx.passThroughType]),
      actualJobDifficulty: toNullableNumber(row[idx.actualJobDifficulty]),
      cleaningPhase: toString(row[idx.cleaningPhase]),
      debrisLevel: toString(row[idx.debrisLevel]),
      estimateMode: toString(row[idx.estimateMode]),
    })
  }
  return leads
}

function groupCount<T, K extends string | number>(
  items: T[],
  getKey: (item: T) => K
): Array<{ key: K; count: number }> {
  const map = new Map<K, number>()
  for (const item of items) {
    const k = getKey(item)
    map.set(k, (map.get(k) || 0) + 1)
  }
  return Array.from(map.entries()).map(([key, count]) => ({ key, count }))
}

export function computeMetrics(leads: Lead[]): Metrics {
  const totalLeads = leads.length
  const totalEstimateLow = leads.reduce((s, l) => s + l.estimateLow, 0)
  const totalEstimateHigh = leads.reduce((s, l) => s + l.estimateHigh, 0)
  const averageTicket = totalLeads ? totalEstimateLow / totalLeads : 0

  const wonLeads = leads.filter((l) => l.wonLostPending === "Won")
  const wonDealsTotal = wonLeads.reduce((s, l) => s + (l.finalPrice || 0), 0)
  const winRate = totalLeads ? wonLeads.length / totalLeads : 0
  const reviewFlagged = leads.filter((l) => l.reviewFlag === "YES").length
  const reviewFlaggedPct = totalLeads ? reviewFlagged / totalLeads : 0

  const byRevenueBucket = REVENUE_BUCKETS.map((bucket) => {
    const bucketLeads = leads.filter((l) => classifyRevenueBucket(l.service) === bucket)
    return {
      bucket,
      estLow: bucketLeads.reduce((s, l) => s + l.estimateLow, 0),
      leads: bucketLeads.length,
    }
  })

  const byLeadSource = groupCount(leads, (l) => l.leadSource || "Unknown")
    .map(({ key, count }) => ({ source: String(key), leads: count }))
    .sort((a, b) => b.leads - a.leads)

  const byMode = groupCount(leads, (l) => l.mode || "Unknown")
    .map(({ key, count }) => ({ mode: String(key), leads: count }))
    .sort((a, b) => b.leads - a.leads)

  const byPropertyType = groupCount(leads, (l) => l.propertyType || "Unknown")
    .map(({ key, count }) => ({ type: String(key), leads: count }))
    .sort((a, b) => b.leads - a.leads)

  const serviceMap = new Map<string, { leads: number; estLow: number }>()
  for (const l of leads) {
    const k = l.service || "Unknown"
    const cur = serviceMap.get(k) || { leads: 0, estLow: 0 }
    cur.leads++
    cur.estLow += l.estimateLow
    serviceMap.set(k, cur)
  }
  const byService = Array.from(serviceMap.entries())
    .map(([service, v]) => ({ service, ...v }))
    .sort((a, b) => b.leads - a.leads)

  const zipMap = new Map<string, { leads: number; estLow: number }>()
  for (const l of leads) {
    const k = l.zip || "Unknown"
    const cur = zipMap.get(k) || { leads: 0, estLow: 0 }
    cur.leads++
    cur.estLow += l.estimateLow
    zipMap.set(k, cur)
  }
  const byZip = Array.from(zipMap.entries())
    .map(([zip, v]) => ({ zip, leads: v.leads, avgTicket: v.leads ? v.estLow / v.leads : 0 }))
    .sort((a, b) => b.leads - a.leads)

  const byConfidence = groupCount(leads, (l) => l.confidence || "Unknown")
    .map(({ key, count }) => ({ confidence: String(key), leads: count }))
    .sort((a, b) => b.leads - a.leads)

  const dailyMap = new Map<string, number>()
  for (const l of leads) {
    if (!l.date) continue
    const day = l.date.slice(0, 10)
    dailyMap.set(day, (dailyMap.get(day) || 0) + 1)
  }
  const dailyLeads = Array.from(dailyMap.entries())
    .map(([date, leads]) => ({ date, leads }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const strategicLeads = leads
    .filter((l) => l.strategicAccount === "YES")
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))

  const reviewFlaggedLeads = leads
    .filter((l) => l.reviewFlag === "YES")
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))

  const byRecurringOpportunity = groupCount(leads, (l) => l.recurringOpportunity || "Unknown")
    .map(({ key, count }) => ({ tier: String(key), leads: count }))
    .sort((a, b) => b.leads - a.leads)

  const byEstimateMode = groupCount(leads, (l) => l.estimateMode || l.mode || "Unknown")
    .map(({ key, count }) => ({ mode: String(key), leads: count }))
    .sort((a, b) => b.leads - a.leads)

  // Every lead with at least one usable contact channel (name/email/phone),
  // newest first — powers the Customer Contacts section.
  const contactableLeads = leads
    .filter((l) => l.customerName || l.customerEmail || l.customerPhone)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))

  return {
    totalLeads,
    totalEstimateLow,
    totalEstimateHigh,
    averageTicket,
    wonDealsTotal,
    winRate,
    reviewFlaggedPct,
    byRevenueBucket,
    byLeadSource,
    byMode,
    byPropertyType,
    byService,
    byZip,
    byConfidence,
    dailyLeads,
    strategicLeads,
    reviewFlaggedLeads,
    byRecurringOpportunity,
    byEstimateMode,
    contactableLeads,
  }
}
