import { anthropic, MODEL, responseText, extractJson } from "./anthropic.js";
import { cached, minutes } from "./cache.js";

const INTEL_PROMPT = `You are a competitive-intelligence analyst for FINA (fina2.net), a SupTech/RegTech/business-intelligence software vendor whose platforms are used by regulators and central banks in 14+ countries.

Use web search to gather TODAY'S picture, then answer with a single JSON object (in a \`\`\`json fence, nothing after it) shaped exactly like this:

{
  "regnology": {
    "summary": "one sentence on what Regnology has been up to lately",
    "items": [ { "title": "...", "detail": "one line of context", "url": "...", "date": "e.g. 'Jul 2026' or '' if unknown" } ]
  },
  "competitors": [ { "name": "...", "headline": "...", "detail": "one line", "url": "" } ],
  "trends": [ { "title": "...", "context": "one line on why it matters", "url": "" } ]
}

Research tasks:
1. Regnology — latest news, announcements, product launches, acquisitions, partnerships (2–4 items, most recent first).
2. Broader SupTech/RegTech/BI competitor scan — Vizor Software, Suade Labs, Wolters Kluwer OneSumX, IBM OpenPages, plus anything notable search surfaces (3–5 headline-level entries; skip competitors with no recent news).
3. Industry trends — what's moving right now in SupTech, RegTech, financial regulatory technology, AI in compliance, and open banking (3–5 items).

Rules: only report things actually found via search, with real URLs; keep every detail/context line to one sentence; prefer items from the last few weeks.`;

async function fetchIntel() {
  let messages = [{ role: "user", content: INTEL_PROMPT }];
  let response;
  // The server-side web search loop can pause; resume up to 3 times.
  for (let i = 0; i < 4; i++) {
    response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 6000,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 8 }],
      messages,
    });
    if (response.stop_reason !== "pause_turn") break;
    messages = [...messages, { role: "assistant", content: response.content }];
  }
  if (response.stop_reason === "refusal") {
    throw new Error("Model declined the research request");
  }
  const data = extractJson(responseText(response));
  return {
    regnology: {
      summary: data.regnology?.summary || "",
      items: Array.isArray(data.regnology?.items) ? data.regnology.items : [],
    },
    competitors: Array.isArray(data.competitors) ? data.competitors : [],
    trends: Array.isArray(data.trends) ? data.trends : [],
    updatedAt: new Date().toISOString(),
  };
}

export function getIntel() {
  return cached("intel", minutes("INTEL_CACHE_MINUTES", 45), fetchIntel);
}
