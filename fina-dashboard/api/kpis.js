import { getKpis } from "../lib/kpis.js";
import { sendJson } from "../lib/http.js";

export default async function handler(req, res) {
  try {
    sendJson(res, 200, await getKpis());
  } catch (err) {
    console.error("kpis error:", err);
    sendJson(res, 502, {
      error:
        err.code === "NO_REPORTS"
          ? "No report found in the Drive folder yet."
          : "Could not load today's KPI report.",
      detail: String(err.message || err),
    });
  }
}
