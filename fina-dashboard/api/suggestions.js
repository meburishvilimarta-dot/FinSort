import { getSuggestions } from "../lib/suggestions.js";
import { sendJson, readJsonBody } from "../lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "POST only" });
    return;
  }
  try {
    const { kpis, intel } = await readJsonBody(req);
    if (!kpis && !intel) {
      sendJson(res, 400, { error: "Send kpis and/or intel in the request body." });
      return;
    }
    sendJson(res, 200, await getSuggestions(kpis, intel));
  } catch (err) {
    console.error("suggestions error:", err);
    sendJson(res, 502, {
      error: "Could not generate suggestions.",
      detail: String(err.message || err),
    });
  }
}
