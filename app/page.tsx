import { fetchLeads, computeMetrics } from "@/lib/sheets"
import { TopNav } from "@/components/TopNav"
import { DashboardView } from "@/components/DashboardView"

// Skip build-time prerender — fetch the sheet at request time so env vars are guaranteed to be set.
export const dynamic = "force-dynamic"
export const revalidate = 300

export default async function Dashboard() {
  let leads
  try {
    leads = await fetchLeads()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return (
      <>
        <TopNav />
        <main className="mx-auto max-w-3xl p-8">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-6">
            <h2 className="text-lg font-semibold text-rose-900">Failed to load data</h2>
            <p className="mt-2 text-sm text-rose-800">
              Check that <code>GOOGLE_SHEET_ID</code>,{" "}
              <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code>, and{" "}
              <code>GOOGLE_PRIVATE_KEY</code> are set in your Vercel environment, and that the
              service account email has been added as a Viewer on the Google Sheet.
            </p>
            <pre className="mt-4 overflow-auto rounded bg-white p-3 text-xs text-rose-900">
              {message}
            </pre>
          </div>
        </main>
      </>
    )
  }

  const metrics = computeMetrics(leads)
  return (
    <>
      <TopNav />
      <DashboardView metrics={metrics} />
    </>
  )
}
