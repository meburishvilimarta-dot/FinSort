import { anthropic, MODEL } from "./anthropic.js";

const SUGGESTIONS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["social", "website", "strategy"],
  properties: {
    social: { type: "array", items: { type: "string" } },
    website: { type: "array", items: { type: "string" } },
    strategy: { type: "array", items: { type: "string" } },
  },
};

export async function getSuggestions(kpis, intel) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    output_config: { format: { type: "json_schema", schema: SUGGESTIONS_SCHEMA } },
    messages: [
      {
        role: "user",
        content: `You advise FINA's marketing team (SupTech/RegTech/BI vendor selling to regulators, central banks and financial institutions). Based on today's KPI data and competitor/trend intel below, produce short, punchy, actionable suggestions — no filler, no generic advice.

Today's KPIs:
${JSON.stringify(kpis ?? "unavailable")}

Competitor & industry intel:
${JSON.stringify(intel ?? "unavailable")}

Return 2–3 bullets per column:
- "social": what to post or adjust this week (tie to the actual numbers or a specific trend/competitor move above).
- "website": what to fix, test or optimize (tie to the actual website/paid metrics).
- "strategy": one bigger-picture positioning move (tie to a competitor move or industry trend).

Each bullet is one sentence, imperative voice, specific.`,
      },
    ],
  });
  if (response.stop_reason === "refusal") {
    throw new Error("Model declined the request");
  }
  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  const data = JSON.parse(text);
  return { ...data, updatedAt: new Date().toISOString() };
}
