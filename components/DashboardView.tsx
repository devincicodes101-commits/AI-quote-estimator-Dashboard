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

export function DashboardView({ metrics: m }: { metrics: Metrics }) {
  const monthProgressPct = Math.min(
    100,
    (m.totalEstimateLow / MONTHLY_REVENUE_TARGET) * 100
  )

  return (
    <main className="mx-auto max-w-7xl space-y-12 p-6 md:p-8">
      {/* ====== EXECUTIVE OVERVIEW ====== */}
      <section id="executive" className="space-y-6 scroll-mt-20">
        <SectionHeader
          title="Executive Overview"
          subtitle="Morning glance — daily KPIs and goal progress"
        />

        <Grid numItemsSm={2} numItemsLg={6} className="gap-4">
          <KpiCard label="Leads (period)" value={formatNumber(m.totalLeads)} />
          <KpiCard label="Total est. volume" value={formatCurrency(m.totalEstimateLow)} />
          <KpiCard label="Average ticket" value={formatCurrency(m.averageTicket)} />
          <KpiCard
            label="Won deals $"
            value={m.wonDealsTotal ? formatCurrency(m.wonDealsTotal) : "No data"}
          />
          <KpiCard label="Win rate" value={formatPercent(m.winRate)} />
          <KpiCard label="Review flagged" value={formatPercent(m.reviewFlaggedPct)} />
        </Grid>

        <Card>
          <div className="flex items-end justify-between">
            <div>
              <Text>Monthly revenue progress</Text>
              <Metric>{formatCurrency(m.totalEstimateLow)}</Metric>
            </div>
            <Text>
              Target {formatCurrency(MONTHLY_REVENUE_TARGET)} ({monthProgressPct.toFixed(1)}%)
            </Text>
          </div>
          <ProgressBar value={monthProgressPct} className="mt-4" />
        </Card>

        <Card>
          <Title>Daily lead volume</Title>
          <AreaChart
            className="mt-4 h-72"
            data={m.dailyLeads.map((d) => ({ date: d.date, Leads: d.leads }))}
            index="date"
            categories={["Leads"]}
            colors={["blue"]}
            showAnimation={false}
            valueFormatter={(v) => formatNumber(v)}
          />
        </Card>
      </section>

      {/* ====== REVENUE MIX ====== */}
      <section id="revenue-mix" className="space-y-6 scroll-mt-20">
        <SectionHeader
          title="Revenue Mix"
          subtitle="Brief §3 buckets vs $2M monthly target mix"
        />

        <Grid numItemsLg={2} className="gap-6">
          <Card>
            <Title>Estimated revenue by service type</Title>
            <BarChart
              className="mt-4 h-72"
              data={m.byRevenueBucket.map((b) => ({
                bucket: b.bucket,
                "Estimate Low": b.estLow,
              }))}
              index="bucket"
              categories={["Estimate Low"]}
              colors={["amber"]}
              valueFormatter={formatCurrency}
              showAnimation={false}
            />
          </Card>

          <Card>
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

        <Card>
          <Title>Services per bucket</Title>
          <BarList
            className="mt-4"
            data={m.byService.slice(0, 12).map((s) => ({
              name: s.service,
              value: s.estLow,
            }))}
            valueFormatter={formatCurrency}
          />
        </Card>
      </section>

      {/* ====== LEAD QUALITY ====== */}
      <section id="lead-quality" className="space-y-6 scroll-mt-20">
        <SectionHeader
          title="Lead Quality + Source"
          subtitle="Where the best leads are coming from"
        />

        <Grid numItemsLg={3} className="gap-6">
          <Card>
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
          <Card>
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
          <Card>
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
          <Card>
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
          <Card>
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
      <section id="strategic" className="space-y-6 scroll-mt-20">
        <SectionHeader
          title="Strategic Pipeline"
          subtitle="Brief §13 — leads worth chasing first"
        />

        <Grid numItemsLg={2} className="gap-6">
          <Card>
            <Title>Recurring opportunity tiers</Title>
            <BarChart
              className="mt-4 h-72"
              data={m.byRecurringOpportunity.map((r) => ({ tier: r.tier, Leads: r.leads }))}
              index="tier"
              categories={["Leads"]}
              colors={["emerald"]}
              valueFormatter={formatNumber}
              showAnimation={false}
            />
          </Card>
          <Card>
            <Title>Strategic accounts ({m.strategicLeads.length})</Title>
            <Text>YES on Strategic Account flag — chase these first</Text>
            <div className="mt-4 max-h-72 overflow-auto">
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
        </Grid>
      </section>

      {/* ====== MARGIN PROTECTION ====== */}
      <section id="margin" className="space-y-6 scroll-mt-20">
        <SectionHeader
          title="Margin Protection"
          subtitle="Leads that need human review before going to customer"
        />

        <Grid numItemsLg={2} className="gap-6">
          <Card>
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
          <Card>
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
      <section id="operations" className="space-y-6 scroll-mt-20">
        <SectionHeader
          title="Operations Insights"
          subtitle="Tuning the engine over time"
        />

        <Grid numItemsLg={2} className="gap-6">
          <Card>
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
          <Card>
            <Title>Leads by ZIP</Title>
            <BarList
              className="mt-4"
              data={m.byZip.slice(0, 12).map((z) => ({ name: z.zip, value: z.leads }))}
              valueFormatter={formatNumber}
            />
          </Card>
        </Grid>

        <Card>
          <Text className="text-xs text-gray-500">
            Pass-through types, logistics add-ons, and actual job difficulty charts will populate
            once the workflow patches add those columns and the team starts filling them.
          </Text>
        </Card>
      </section>

      <footer className="pt-8 text-center text-xs text-gray-400">
        Data refreshes every 5 minutes from the live Google Sheet. {m.totalLeads} leads loaded.
      </footer>
    </main>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-gray-200 pb-2">
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
    </div>
  )
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <Text>{label}</Text>
      <Metric className="mt-2">{value}</Metric>
    </Card>
  )
}
