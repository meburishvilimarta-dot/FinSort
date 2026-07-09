import { anthropic, MODEL } from "./anthropic.js";
import { cached, minutes } from "./cache.js";
import { driveConfigured, fetchDailyReports } from "./drive.js";
import { SAMPLE_KPIS } from "./sample-data.js";

const METRIC_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["label", "value", "delta", "trend", "positive"],
  properties: {
    label: { type: "string", description: "Short metric name, e.g. 'Sessions'" },
    value: { type: "string", description: "Formatted headline value, e.g. '12.4K' or '3.1%'" },
    delta: { type: "string", description: "Change vs previous day, e.g. '+4.2%'. Empty string if unknown." },
    trend: { type: "string", enum: ["up", "down", "flat", "none"] },
    positive: {
      type: "boolean",
      description: "Whether this change is GOOD for FINA (a falling bounce rate is positive).",
    },
  },
};

const CHANNEL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["metrics", "highlight"],
  properties: {
    metrics: { type: "array", items: METRIC_SCHEMA },
    highlight: {
      type: "string",
      description: "One-line callout (top post, top landing page, keyword movement). Empty string if none.",
    },
  },
};

const KPI_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["reportDate", "channels", "note"],
  properties: {
    reportDate: { type: "string" },
    note: { type: "string", description: "One short caveat about the data, or empty string." },
    channels: {
      type: "object",
      additionalProperties: false,
      required: ["social", "website", "paid", "email"],
      properties: {
        social: CHANNEL_SCHEMA,
        website: CHANNEL_SCHEMA,
        paid: CHANNEL_SCHEMA,
        email: CHANNEL_SCHEMA,
      },
    },
  },
};

function reportsPrompt(reports) {
  const sections = reports.days
    .map(
      (day) =>
        `## Reports for ${day.date}\n` +
        day.files
          .map((f) => `### File: ${f.name}\n\`\`\`\n${f.text}\n\`\`\``)
          .join("\n\n"),
    )
    .join("\n\n");

  return `You are parsing FINA's daily marketing exports (GA4, Meta Ads, LinkedIn, Mailchimp, etc.) into dashboard KPIs. FINA is a SupTech/RegTech/BI software vendor.

Below are the raw exports for the latest report day${reports.days.length > 1 ? " and the previous report day (use it to compute day-over-day deltas)" : ""}.

${sections}

Extract KPIs grouped by channel:
- social: follower count, engagement rate, reach/impressions; highlight = top-performing post.
- website: sessions, conversion rate, bounce rate; highlight = top landing page or notable organic keyword movement.
- paid: spend, CPC, CTR, ROAS, conversions.
- email: open rate, CTR, list growth, unsubscribe rate.

Rules:
- Report only numbers actually present in the files — never invent a value. If a channel has no data, return an empty metrics array for it and mention that in "note".
- 3–5 metrics per channel, most important first. Format values compactly ('12.4K', '€1,240', '3.1%').
- delta is vs the previous day's file when available, otherwise "" with trend "none".
- "positive" reflects whether the movement is good for FINA (bounce rate down = positive, unsubscribe rate up = negative).
- reportDate is the date of the latest report day (${reports.reportDate}).`;
}

async function parseKpisWithClaude(reports) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    output_config: { format: { type: "json_schema", schema: KPI_SCHEMA } },
    messages: [{ role: "user", content: reportsPrompt(reports) }],
  });
  if (response.stop_reason === "refusal") {
    throw new Error("Model declined to process the reports");
  }
  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  return JSON.parse(text);
}

export async function getKpis() {
  if (!driveConfigured()) {
    return {
      ...SAMPLE_KPIS,
      sample: true,
      stale: false,
      updatedAt: new Date().toISOString(),
      message:
        "Google Drive isn't connected yet — showing sample data. Set the GOOGLE_* env vars to go live.",
    };
  }

  return cached("kpis", minutes("KPIS_CACHE_MINUTES", 10), async () => {
    const reports = await fetchDailyReports();
    const kpis = await parseKpisWithClaude(reports);
    return {
      ...kpis,
      sample: false,
      stale: reports.stale,
      sourceFiles: reports.days[0].files.map((f) => f.name),
      updatedAt: new Date().toISOString(),
      message: reports.stale
        ? `No report found in Drive yet today — showing ${reports.reportDate} data.`
        : "",
    };
  });
}
