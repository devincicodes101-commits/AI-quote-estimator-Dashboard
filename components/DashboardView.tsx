"use client"

import {
  Card,
  Metric,
  Text,
  Title,
  BarList,
  DonutChart,
  BarChart,
  AreaChart,
  SparkAreaChart,
  ProgressBar,
  Grid,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
} from "@tremor/react"
import type { Metrics } from "@/lib/types"
import { MONTHLY_REVENUE_TARGET, MONTHLY_TARGETS } from "@/lib/revenue-bucket"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/parsers"

// Inline icon paths reused across the KPI cards.
const ICONS = {
  users: "M16 11a4 4 0 10-4-4 4 4 0 004 4zm-8 0a4 4 0 10-4-4 4 4 0 004 4zm0 2c-2.7 0-8 1.3-8 4v3h9v-3c0-1 .4-1.9 1-2.7A12 12 0 008 13zm8 0c-.4 0-.9 0-1.4.1A5.3 5.3 0 0117 17v3h7v-3c0-2.7-5.3-4-8-4z",
  cash: "M3 6h18v12H3V6zm9 3a3 3 0 100 6 3 3 0 000-6zM6 8a2 2 0 01-2 2v4a2 2 0 012 2h12a2 2 0 012-2v-4a2 2 0 01-2-2H6z",
  ticket: "M20 4H4a2 2 0 00-2 2v3a2 2 0 010 4v3a2 2 0 002 2h16a2 2 0 002-2v-3a2 2 0 010-4V6a2 2 0 00-2-2zm-2 13H6v-2h12v2zm0-4H6v-2h12v2z",
  trophy: "M19 5h-2V3H7v2H5a2 2 0 00-2 2v2a4 4 0 004 4 5 5 0 004 3v2H8v2h8v-2h-3v-2a5 5 0 004-3 4 4 0 004-4V7a2 2 0 00-2-2zM5 9V7h2v4a2 2 0 01-2-2zm14 0a2 2 0 01-2 2V7h2v2z",
  target: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 110 12 6 6 0 010-12zm0 4a2 2 0 100 4 2 2 0 000-4z",
  flag: "M5 3v18H3V3h2zm2 0h12l-2.5 4L19 11H7V3z",
}

export function DashboardView({ metrics: m }: { metrics: Metrics }) {
  const monthProgressPct = Math.min(
    100,
    (m.totalEstimateLow / MONTHLY_REVENUE_TARGET) * 100
  )

  const leadSpark = m.dailyLeads.map((d) => ({ date: d.date, Leads: d.leads }))

  return (
    <main className="mx-auto max-w-7xl space-y-12 p-4 md:p-8">
      {/* ====== EXECUTIVE OVERVIEW ====== */}
      <section id="executive" className="space-y-6 scroll-mt-24">
        <SectionHeader
          title="Executive Overview"
          subtitle="Morning glance — daily KPIs and goal progress"
        />

        <Grid numItemsSm={2} numItemsLg={4} className="gap-4">
          <KpiCard
            label="Leads (period)"
            value={formatNumber(m.totalLeads)}
            icon={ICONS.users}
            accent="blue"
            spark={leadSpark}
          />
          <KpiCard
            label="Total est. volume"
            value={formatCurrency(m.totalEstimateLow)}
            icon={ICONS.cash}
            accent="emerald"
          />
          <KpiCard
            label="Average ticket"
            value={formatCurrency(m.averageTicket)}
            icon={ICONS.ticket}
            accent="violet"
          />
          <KpiCard
            label="Review flagged"
            value={formatPercent(m.reviewFlaggedPct)}
            icon={ICONS.flag}
            accent="rose"
          />
        </Grid>

        <Card className="border-[#2a2e3c]">
          <div className="flex items-end justify-between">
            <div>
              <Text>Monthly revenue progress</Text>
              <Metric className="mt-1">{formatCurrency(m.totalEstimateLow)}</Metric>
            </div>
            <Text>
              Target {formatCurrency(MONTHLY_REVENUE_TARGET)} ({monthProgressPct.toFixed(1)}%)
            </Text>
          </div>
          <ProgressBar value={monthProgressPct} color="blue" className="mt-4" />
        </Card>

        <Card className="border-[#2a2e3c]">
          <Title>Daily lead volume</Title>
          <AreaChart
            className="mt-4 h-72"
            data={leadSpark}
            index="date"
            categories={["Leads"]}
            colors={["blue"]}
            curveType="natural"
            showAnimation={false}
            showGradient
            valueFormatter={(v) => formatNumber(v)}
          />
        </Card>
      </section>

      {/* ====== REVENUE MIX ====== */}
      <section id="revenue-mix" className="space-y-6 scroll-mt-24">
        <SectionHeader
          title="Revenue Mix"
          subtitle="Brief §3 buckets vs $2M monthly target mix"
        />

        <Grid numItemsLg={2} className="gap-6">
          <Card className="border-[#2a2e3c]">
            <Title>Estimated revenue by service type</Title>
            <BarChart
              className="mt-4 h-72"
              data={m.byRevenueBucket.map((b) => ({
                bucket: b.bucket,
                "Estimate Low": b.estLow,
              }))}
              index="bucket"
              categories={["Estimate Low"]}
              colors={["pink"]}
              valueFormatter={formatCurrency}
              showAnimation={false}
            />
          </Card>

          <Card className="border-[#2a2e3c]">
            <Title>Bucket vs monthly target</Title>
            <Table className="mt-4">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Bucket</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actual</TableHeaderCell>
                  <TableHeaderCell className="text-right">Target</TableHeaderCell>
                  <TableHeaderCell className="text-right">% to goal</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {m.byRevenueBucket.map((b) => {
                  const t = MONTHLY_TARGETS[b.bucket]
                  const goal = t ? (t.low + t.high) / 2 : 0
                  const pct = goal ? (b.estLow / goal) * 100 : 0
                  return (
                    <TableRow key={b.bucket}>
                      <TableCell>{b.bucket}</TableCell>
                      <TableCell className="text-right">{formatCurrency(b.estLow)}</TableCell>
                      <TableCell className="text-right text-gray-500">
                        {t ? `${formatCurrency(t.low)}–${formatCurrency(t.high)}` : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge color={pct >= 100 ? "emerald" : pct >= 50 ? "amber" : "rose"}>
                          {pct.toFixed(0)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        </Grid>

        <Card className="border-[#2a2e3c]">
          <Title>Services per bucket</Title>
          <BarList
            className="mt-4"
            color="pink"
            data={m.byService.slice(0, 12).map((s) => ({
              name: s.service,
              value: s.estLow,
            }))}
            valueFormatter={formatCurrency}
          />
        </Card>
      </section>

      {/* ====== LEAD QUALITY ====== */}
      <section id="lead-quality" className="space-y-6 scroll-mt-24">
        <SectionHeader
          title="Lead Quality + Source"
          subtitle="Where the best leads are coming from"
        />

        <Grid numItemsLg={3} className="gap-6">
          <Card className="border-[#2a2e3c]">
            <Title>Lead source mix</Title>
            <DonutChart
              className="mt-4 h-64"
              data={m.byLeadSource.map((s) => ({ name: s.source, value: s.leads }))}
              index="name"
              category="value"
              valueFormatter={formatNumber}
              showAnimation={false}
            />
          </Card>
          <Card className="border-[#2a2e3c]">
            <Title>Leads by intake channel</Title>
            <DonutChart
              className="mt-4 h-64"
              data={m.byMode.map((s) => ({ name: s.mode, value: s.leads }))}
              index="name"
              category="value"
              valueFormatter={formatNumber}
              showAnimation={false}
            />
          </Card>
          <Card className="border-[#2a2e3c]">
            <Title>Leads by property type</Title>
            <DonutChart
              className="mt-4 h-64"
              data={m.byPropertyType.map((s) => ({ name: s.type, value: s.leads }))}
              index="name"
              category="value"
              valueFormatter={formatNumber}
              showAnimation={false}
            />
          </Card>
        </Grid>

        <Grid numItemsLg={2} className="gap-6">
          <Card className="border-[#2a2e3c]">
            <Title>Top requested services</Title>
            <BarList
              className="mt-4"
              data={m.byService.slice(0, 10).map((s) => ({
                name: s.service,
                value: s.leads,
              }))}
              valueFormatter={formatNumber}
            />
          </Card>
          <Card className="border-[#2a2e3c]">
            <Title>Top ZIP codes by leads</Title>
            <Table className="mt-4">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>ZIP</TableHeaderCell>
                  <TableHeaderCell className="text-right">Leads</TableHeaderCell>
                  <TableHeaderCell className="text-right">Avg ticket</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {m.byZip.slice(0, 10).map((z) => (
                  <TableRow key={z.zip}>
                    <TableCell>{z.zip}</TableCell>
                    <TableCell className="text-right">{z.leads}</TableCell>
                    <TableCell className="text-right">{formatCurrency(z.avgTicket)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Grid>
      </section>

      {/* ====== STRATEGIC PIPELINE ====== */}
      <section id="strategic" className="space-y-6 scroll-mt-24">
        <SectionHeader
          title="Strategic Pipeline"
          subtitle="Brief §13 — leads worth chasing first"
        />

        <Card className="border-[#2a2e3c]">
          <Title>Strategic accounts ({m.strategicLeads.length})</Title>
          <Text>YES on Strategic Account flag — chase these first</Text>
          <div className="mt-4 max-h-96 overflow-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Service</TableHeaderCell>
                  <TableHeaderCell>Property</TableHeaderCell>
                  <TableHeaderCell className="text-right">Est Low</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {m.strategicLeads.slice(0, 25).map((l) => (
                  <TableRow key={l.leadId}>
                    <TableCell>{l.date.slice(0, 10)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{l.service}</TableCell>
                    <TableCell>{l.propertyType}</TableCell>
                    <TableCell className="text-right">{formatCurrency(l.estimateLow)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      {/* ====== MARGIN PROTECTION ====== */}
      <section id="margin" className="space-y-6 scroll-mt-24">
        <SectionHeader
          title="Margin Protection"
          subtitle="Leads that need human review before going to customer"
        />

        <Grid numItemsLg={2} className="gap-6">
          <Card className="border-[#2a2e3c]">
            <Title>Confidence breakdown</Title>
            <DonutChart
              className="mt-4 h-64"
              data={m.byConfidence.map((c) => ({ name: c.confidence, value: c.leads }))}
              index="name"
              category="value"
              colors={["emerald", "amber", "rose", "gray"]}
              valueFormatter={formatNumber}
              showAnimation={false}
            />
          </Card>
          <Card className="border-[#2a2e3c]">
            <Title>Review-flagged leads ({m.reviewFlaggedLeads.length})</Title>
            <Text>Confidence Low, margin warning, or hourly-rate flag</Text>
            <div className="mt-4 max-h-64 overflow-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Service</TableHeaderCell>
                    <TableHeaderCell>Conf.</TableHeaderCell>
                    <TableHeaderCell className="text-right">Range</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {m.reviewFlaggedLeads.slice(0, 25).map((l) => (
                    <TableRow key={l.leadId}>
                      <TableCell>{l.date.slice(0, 10)}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{l.service}</TableCell>
                      <TableCell>
                        <Badge
                          color={
                            l.confidence === "High"
                              ? "emerald"
                              : l.confidence === "Medium"
                                ? "amber"
                                : "rose"
                          }
                        >
                          {l.confidence || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(l.estimateLow)}–{formatCurrency(l.estimateHigh)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </Grid>
      </section>

      {/* ====== OPERATIONS ====== */}
      <section id="operations" className="space-y-6 scroll-mt-24">
        <SectionHeader
          title="Operations Insights"
          subtitle="Tuning the engine over time"
        />

        <Grid numItemsLg={2} className="gap-6">
          <Card className="border-[#2a2e3c]">
            <Title>Estimate mode split</Title>
            <DonutChart
              className="mt-4 h-64"
              data={m.byEstimateMode.map((b) => ({ name: b.mode, value: b.leads }))}
              index="name"
              category="value"
              valueFormatter={formatNumber}
              showAnimation={false}
            />
          </Card>
          <Card className="border-[#2a2e3c]">
            <Title>Leads by ZIP</Title>
            <BarList
              className="mt-4"
              data={m.byZip.slice(0, 12).map((z) => ({ name: z.zip, value: z.leads }))}
              valueFormatter={formatNumber}
            />
          </Card>
        </Grid>

        <Card className="border-[#2a2e3c]">
          <Text className="text-xs text-gray-500">
            Pass-through types, logistics add-ons, and actual job difficulty charts will populate
            once the workflow patches add those columns and the team starts filling them.
          </Text>
        </Card>
      </section>

      {/* ====== CUSTOMER CONTACTS ====== */}
      <section id="contacts" className="space-y-6 scroll-mt-24">
        <SectionHeader
          title="Customer Contacts"
          subtitle="Every lead with a rep-collected name, email, or phone — newest first. Use this to follow up."
        />

        <Grid numItems={1} numItemsSm={3} className="gap-4">
          <Card className="border-[#2a2e3c]">
            <Text className="text-xs text-gray-500">Contactable leads</Text>
            <Metric className="text-white">{formatNumber(m.contactableLeads.length)}</Metric>
          </Card>
          <Card className="border-[#2a2e3c]">
            <Text className="text-xs text-gray-500">With email</Text>
            <Metric className="text-white">
              {formatNumber(m.contactableLeads.filter((l) => l.customerEmail).length)}
            </Metric>
          </Card>
          <Card className="border-[#2a2e3c]">
            <Text className="text-xs text-gray-500">With phone</Text>
            <Metric className="text-white">
              {formatNumber(m.contactableLeads.filter((l) => l.customerPhone).length)}
            </Metric>
          </Card>
        </Grid>

        <Card className="border-[#2a2e3c]">
          <Title className="text-white">Follow-up list</Title>
          <Text className="text-xs text-gray-500">
            Showing the {Math.min(m.contactableLeads.length, 100)} most recent contactable leads.
          </Text>
          {m.contactableLeads.length === 0 ? (
            <Text className="mt-6 text-sm text-gray-500">
              No leads with contact info yet. Once reps start filling in the new "Customer contact"
              section on the internal form, they'll show up here automatically.
            </Text>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="text-gray-400">Date</TableHeaderCell>
                    <TableHeaderCell className="text-gray-400">Name</TableHeaderCell>
                    <TableHeaderCell className="text-gray-400">Email</TableHeaderCell>
                    <TableHeaderCell className="text-gray-400">Phone</TableHeaderCell>
                    <TableHeaderCell className="text-gray-400">Service</TableHeaderCell>
                    <TableHeaderCell className="text-gray-400">Estimate</TableHeaderCell>
                    <TableHeaderCell className="text-gray-400">Status</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {m.contactableLeads.slice(0, 100).map((lead) => (
                    <TableRow key={lead.leadId} className="border-t border-[#2a2e3c]">
                      <TableCell className="text-gray-300">
                        {(lead.date || "").slice(0, 10)}
                      </TableCell>
                      <TableCell className="text-white">
                        {lead.customerName || "—"}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {lead.customerEmail ? (
                          <a
                            href={`mailto:${lead.customerEmail}`}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {lead.customerEmail}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {lead.customerPhone ? (
                          <a
                            href={`tel:${lead.customerPhone.replace(/[^\d+]/g, "")}`}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {lead.customerPhone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">{lead.service || "—"}</TableCell>
                      <TableCell className="text-gray-300">
                        {formatCurrency(lead.estimateLow)}–{formatCurrency(lead.estimateHigh)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          size="xs"
                          color={
                            lead.wonLostPending === "Won"
                              ? "emerald"
                              : lead.wonLostPending === "Lost"
                                ? "rose"
                                : "amber"
                          }
                        >
                          {lead.wonLostPending || "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </section>

      <footer className="pt-8 text-center text-xs text-gray-500">
        Data refreshes every 5 minutes from the live Google Sheet. {m.totalLeads} leads loaded.
      </footer>
    </main>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-[#2a2e3c] pb-3">
      <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
    </div>
  )
}

const ACCENTS: Record<string, { chip: string; spark: string }> = {
  blue: { chip: "bg-blue-500/15 text-blue-400", spark: "blue" },
  emerald: { chip: "bg-emerald-500/15 text-emerald-400", spark: "emerald" },
  violet: { chip: "bg-violet-500/15 text-violet-400", spark: "violet" },
  amber: { chip: "bg-amber-500/15 text-amber-400", spark: "amber" },
  cyan: { chip: "bg-cyan-500/15 text-cyan-400", spark: "cyan" },
  rose: { chip: "bg-rose-500/15 text-rose-400", spark: "rose" },
}

function KpiCard({
  label,
  value,
  icon,
  accent = "blue",
  spark,
}: {
  label: string
  value: string
  icon: string
  accent?: keyof typeof ACCENTS | string
  spark?: Array<{ date: string; Leads: number }>
}) {
  const a = ACCENTS[accent] ?? ACCENTS.blue
  return (
    <Card className="border-[#2a2e3c] !p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Text className="truncate text-xs">{label}</Text>
          <Metric className="mt-2 text-xl">{value}</Metric>
        </div>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.chip}`}>
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d={icon} />
          </svg>
        </span>
      </div>
      {spark && spark.length > 1 && (
        <SparkAreaChart
          data={spark}
          index="date"
          categories={["Leads"]}
          colors={[a.spark]}
          showGradient
          className="mt-3 h-10 w-full"
        />
      )}
    </Card>
  )
}
