import { fetchLeads, computeMetrics } from "@/lib/sheets"
import { TopNav } from "@/components/TopNav"
import { DashboardView } from "@/components/DashboardView"

// Skip build-time prerender — fetch the sheet at request time so env vars are guaranteed to be set.
export const dynamic = "force-dynamic"
export const revalidate = 300

function maskEmail(email: string | undefined): string {
  if (!email) return "(empty)"
  return `${email.slice(0, 18)}...${email.slice(-22)} [len=${email.length}]`
}

function maskKey(key: string | undefined): string {
  if (!key) return "(empty)"
  const hasLiteralBackslashN = key.includes("\\n")
  const hasRealNewlines = key.includes("\n")
  const begin = key.startsWith("-----BEGIN PRIVATE KEY-----")
  const end = key.trimEnd().endsWith("-----END PRIVATE KEY-----") || key.includes("END PRIVATE KEY-----\\n")
  return `[len=${key.length}, starts-BEGIN=${begin}, has-END=${end}, contains-\\n-literal=${hasLiteralBackslashN}, contains-real-newline=${hasRealNewlines}, first-40=${JSON.stringify(key.slice(0, 40))}, last-40=${JSON.stringify(key.slice(-40))}]`
}

export default async function Dashboard() {
  let leads
  try {
    leads = await fetchLeads()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const emailDiag = maskEmail(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL)
    const keyDiag = maskKey(process.env.GOOGLE_PRIVATE_KEY)
    const sheetIdDiag = process.env.GOOGLE_SHEET_ID
      ? `${process.env.GOOGLE_SHEET_ID.slice(0, 8)}...${process.env.GOOGLE_SHEET_ID.slice(-6)} [len=${process.env.GOOGLE_SHEET_ID.length}]`
      : "(empty)"
    const tabDiag = process.env.GOOGLE_SHEET_TAB || "(empty)"
    return (
      <>
        <TopNav />
        <main className="mx-auto max-w-4xl p-8">
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
            <h3 className="mt-6 text-sm font-semibold text-rose-900">Env var diagnostics</h3>
            <pre className="mt-2 overflow-auto rounded bg-white p-3 text-xs text-gray-800 whitespace-pre-wrap break-all">
              GOOGLE_SHEET_ID:                {sheetIdDiag}
              {"\n"}GOOGLE_SHEET_TAB:               {tabDiag}
              {"\n"}GOOGLE_SERVICE_ACCOUNT_EMAIL:   {emailDiag}
              {"\n"}GOOGLE_PRIVATE_KEY:             {keyDiag}
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
