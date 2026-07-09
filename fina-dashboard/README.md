# FINA Marketing Intelligence Dashboard

A small web app (static front end + Node serverless backend) that shows a live
marketing dashboard for FINA. On every load it:

1. **KPIs** — reads the newest report files from the `FINA-Marketing-Daily`
   Google Drive folder (GA4 / Meta Ads / LinkedIn / Mailchimp exports), has
   Claude parse them into structured KPIs with day-over-day deltas, and renders
   them by channel (Social, Website/SEO, Paid, Email).
2. **Competitor watch** — runs a live Claude web search for Regnology news plus
   a broader SupTech/RegTech/BI scan (Vizor, Suade Labs, Wolters Kluwer
   OneSumX, IBM OpenPages, …).
3. **Suggestions** — generates three short action columns (Social / Website /
   Strategy) from the KPI + intel data.
4. **Trending today** — 3–5 live industry headlines with one-line context.

The Anthropic API key lives **server-side only** (Vercel env var / `.env`);
the browser talks only to `/api/*`.

## Layout

```
api/            Vercel serverless functions (kpis, intel, suggestions)
lib/            Drive client, Claude calls, caching
public/         The dashboard (single dark-theme HTML page)
server.mjs      Local dev server mirroring the Vercel routing
```

## Run locally

```sh
cd fina-dashboard
npm install
cp .env.example .env   # fill in ANTHROPIC_API_KEY (+ Google creds for live KPIs)
npm run dev            # http://localhost:3000
```

Without Google credentials the KPI section shows clearly-flagged **sample
data** so the page is still demoable; competitor watch and trends are always
live (they only need the Anthropic key).

## Deploy to Vercel

1. Import the repo in Vercel and set **Root Directory** to `fina-dashboard`
   (framework preset: *Other*; no build command needed — static files are
   served from `public/`, functions from `api/`).
2. Add the environment variables from `.env.example` in Project → Settings →
   Environment Variables.
3. Deploy. `vercel.json` raises the function timeout to 120 s because the
   web-search call can take ~30–60 s.

## Google Drive setup (live KPIs)

1. In Google Cloud Console: create a project → enable the **Google Drive
   API** → create a **service account** → create a JSON key for it.
2. Share the `FINA-Marketing-Daily` Drive folder with the service account's
   email address (Viewer is enough).
3. Set `GOOGLE_SERVICE_ACCOUNT_JSON` (the whole key file as one line) — or
   `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY` — in the env.

The backend reads the newest report day **and** the previous one so Claude can
compute day-over-day deltas. If today's export hasn't landed yet, the
dashboard shows yesterday's numbers with a "no report yet today" notice
instead of breaking.

## Behavior notes

- Results are cached in memory per warm server instance (KPIs 10 min, intel
  45 min by default) so a burst of opens doesn't re-run Drive + web search
  every time; a fresh instance always refetches.
- Every model-facing prompt forbids invented numbers; KPI and suggestion
  responses are schema-constrained (structured outputs), and the web-search
  response is parsed defensively.
- The only interactive element is a **Retry** button that appears on a failed
  section — no settings, tabs, or dropdowns, per the design brief.
