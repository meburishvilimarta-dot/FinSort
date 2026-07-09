import { getIntel } from "../lib/intel.js";
import { sendJson } from "../lib/http.js";

export default async function handler(req, res) {
  try {
    sendJson(res, 200, await getIntel());
  } catch (err) {
    console.error("intel error:", err);
    sendJson(res, 502, {
      error: "Could not load competitor & industry intel.",
      detail: String(err.message || err),
    });
  }
}
