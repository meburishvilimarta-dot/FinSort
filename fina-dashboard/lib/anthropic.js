import Anthropic from "@anthropic-ai/sdk";

// Reads ANTHROPIC_API_KEY from the environment — the key lives server-side
// only and is never sent to the browser.
export const anthropic = new Anthropic();

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

/**
 * Pull the concatenated text out of a Messages API response, skipping
 * thinking / tool-result blocks.
 */
export function responseText(message) {
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

/**
 * Defensively extract a JSON object from model output: prefer the last
 * ```json fence, fall back to the outermost { ... } span.
 */
export function extractJson(text) {
  const fences = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)];
  const candidates = fences.length
    ? [fences[fences.length - 1][1]]
    : [];
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last > first) candidates.push(text.slice(first, last + 1));
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // try the next candidate
    }
  }
  throw new Error("Model response did not contain parseable JSON");
}
