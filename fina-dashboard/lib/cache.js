// In-memory TTL cache with in-flight de-duplication. On Vercel this lives per
// warm serverless instance — good enough to stop a burst of dashboard opens
// from re-running Drive reads and web searches on every load. Cold starts
// simply refetch.
const entries = new Map();

export async function cached(key, ttlMs, fetcher) {
  const now = Date.now();
  const entry = entries.get(key);
  if (entry) {
    if (entry.value !== undefined && now - entry.at < ttlMs) return entry.value;
    if (entry.inflight) return entry.inflight;
  }
  const inflight = (async () => {
    const value = await fetcher();
    entries.set(key, { value, at: Date.now() });
    return value;
  })();
  entries.set(key, { ...(entry || {}), inflight });
  try {
    return await inflight;
  } catch (err) {
    // Don't cache failures; allow the stale value to survive for retry logic.
    const current = entries.get(key);
    if (current?.inflight === inflight) {
      entries.set(key, { value: current.value, at: current.at ?? 0 });
    }
    throw err;
  }
}

export function minutes(name, fallback) {
  const n = Number(process.env[name]);
  return (Number.isFinite(n) && n > 0 ? n : fallback) * 60 * 1000;
}
