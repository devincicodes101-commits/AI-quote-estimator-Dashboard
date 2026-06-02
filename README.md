# Squeegee Squad LA — Dashboard

Next.js single-page dashboard for the Squeegee Squad LA estimating tool. Reads live data from the project Google Sheet via a service account, computes KPIs and revenue-bucket breakdowns, and renders them with Tremor.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** + **Tremor** for charts and layout
- **googleapis** for Sheets API access
- Deploys to **Vercel** in one click

---

## 1. Setup the Google service account (one-time)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a new project (or pick an existing one)
2. Enable the **Google Sheets API** for the project
3. Go to **IAM & Admin** → **Service Accounts** → **Create service account**
   - Name: `squeegee-dashboard-reader`
   - Role: Viewer
4. Click the new service account → **Keys** tab → **Add key** → **JSON** → download the file
5. Open the JSON file. You'll need 2 values for the env vars:
   - `client_email` → goes into `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → goes into `GOOGLE_PRIVATE_KEY` (keep the quotes, keep the `\n` characters as-is)
6. **Share the Google Sheet** (`1vdjvGmvi4gNvs1cx30DQiHzOkfWtn1FfBXXtMRsg8sw`) with the service account's `client_email` as a Viewer

---

## 2. Local development

```bash
# install
npm install

# create env file
cp .env.example .env.local
# then edit .env.local and paste the service account email + private key

# run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 3. Deploy to Vercel

1. Push this repo to GitHub
2. In Vercel: **New project** → import the GitHub repo
3. Add the env vars from `.env.example` in **Project Settings → Environment Variables**:
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SHEET_TAB` (default: `Dashboard Template`)
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (paste exactly as it appears in the JSON, including the `\n`)
4. Click **Deploy**

The dashboard refreshes its sheet data every 5 minutes (`revalidate = 300` in `app/page.tsx`).

---

## What's on the page

One scrolling page with anchor nav across 6 sections, each mapped to the brief §16 requirements:

| Section | Brief fields covered |
|---|---|
| Executive Overview | #6 Estimate range, #7 Final price, #8 Won/Lost, #16 Review flag |
| Revenue Mix | #3 Service, brief §3 monthly mix targets |
| Lead Quality | #1 Source, #2 Mode, #4 Property type, ZIP analysis |
| Strategic Pipeline | #15 Recurring opportunity, Strategic Account flag |
| Margin Protection | Confidence breakdown, Review-flagged queue |
| Operations | Estimate mode, ZIP distribution |

---

## File layout

```
app/
  layout.tsx          # HTML shell
  page.tsx            # The dashboard (single scrolling page)
  globals.css         # Tailwind directives + small overrides
components/
  TopNav.tsx          # Sticky header with section anchors
lib/
  types.ts            # Lead and Metrics TypeScript shapes
  sheets.ts           # Service-account fetch + computeMetrics
  parsers.ts          # Helpers (string -> number, currency formatting)
  revenue-bucket.ts   # Service -> bucket classifier + monthly targets
```

---

## Known data plumbing gaps

The dashboard currently doesn't display these because the n8n workflows don't write the columns yet (or stores them as un-aggregatable strings):

- Pass-through cost types (column not written)
- Logistics add-on factors (column not written)
- Sub Payout / Company Gross as numeric (currently strings like `"450 - 550"` — parser handles this but the source is fragile)
- Actual Job Difficulty (manual fill after jobs complete — will populate over time)

When the workflow patches land, these sections will populate automatically with no code changes here.
