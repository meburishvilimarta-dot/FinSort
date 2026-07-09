import crypto from "node:crypto";

// Minimal Google Drive (read-only) client using a service account. No
// googleapis dependency: we sign the OAuth JWT ourselves with node:crypto.
//
// Setup: create a service account in Google Cloud, enable the Drive API,
// share the "FINA-Marketing-Daily" folder with the service account's email
// (viewer is enough), and set either GOOGLE_SERVICE_ACCOUNT_JSON or
// GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY.

const DRIVE = "https://www.googleapis.com/drive/v3";
const MAX_FILE_BYTES = 60_000; // keep prompt sizes sane
const MAX_FILES_PER_DAY = 10;

function credentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    const parsed = JSON.parse(raw);
    return { email: parsed.client_email, key: parsed.private_key };
  }
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Vercel env vars store newlines as literal \n — restore them.
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (email && key) return { email, key };
  return null;
}

export function driveConfigured() {
  try {
    return credentials() !== null;
  } catch {
    return false;
  }
}

let tokenCache = { token: null, expiresAt: 0 };

async function accessToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }
  const creds = credentials();
  if (!creds) throw new Error("Google Drive credentials are not configured");

  const now = Math.floor(Date.now() / 1000);
  const b64 = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  const unsigned =
    b64({ alg: "RS256", typ: "JWT" }) +
    "." +
    b64({
      iss: creds.email,
      scope: "https://www.googleapis.com/auth/drive.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    });
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsigned)
    .sign(creds.key, "base64url");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return tokenCache.token;
}

async function driveGet(path, params) {
  const token = await accessToken();
  const url = new URL(`${DRIVE}${path}`);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Drive API ${path} failed (${res.status}): ${await res.text()}`);
  }
  return res;
}

async function folderId() {
  if (process.env.DRIVE_FOLDER_ID) return process.env.DRIVE_FOLDER_ID;
  const name = process.env.DRIVE_FOLDER_NAME || "FINA-Marketing-Daily";
  const res = await driveGet("/files", {
    q: `name = '${name.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id,name)",
    pageSize: "5",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
  });
  const { files } = await res.json();
  if (!files?.length) {
    throw new Error(`Drive folder "${name}" not found — is it shared with the service account?`);
  }
  return files[0].id;
}

async function fileText(file) {
  let res;
  if (file.mimeType === "application/vnd.google-apps.spreadsheet") {
    res = await driveGet(`/files/${file.id}/export`, { mimeType: "text/csv" });
  } else if (file.mimeType.startsWith("application/vnd.google-apps.")) {
    res = await driveGet(`/files/${file.id}/export`, { mimeType: "text/plain" });
  } else {
    res = await driveGet(`/files/${file.id}`, { alt: "media", supportsAllDrives: "true" });
  }
  const text = await res.text();
  return text.length > MAX_FILE_BYTES
    ? text.slice(0, MAX_FILE_BYTES) + "\n…[truncated]"
    : text;
}

function localDateString(date, timeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Fetch the most recent day of reports from the Drive folder, plus the
 * previous report day (so the model can compute day-over-day deltas).
 *
 * Returns { reportDate, stale, days: [{date, files:[{name, text}]}] }
 * where days[0] is the latest day. `stale` is true when the latest report
 * day is older than today in the dashboard timezone.
 */
export async function fetchDailyReports() {
  const id = await folderId();
  const res = await driveGet("/files", {
    q: `'${id}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
    orderBy: "modifiedTime desc",
    fields: "files(id,name,mimeType,modifiedTime,size)",
    pageSize: "40",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
  });
  const { files } = await res.json();
  if (!files?.length) throw Object.assign(new Error("The Drive folder is empty"), { code: "NO_REPORTS" });

  const timeZone = process.env.DASHBOARD_TIMEZONE || "Asia/Tbilisi";
  const byDay = new Map();
  for (const file of files) {
    const day = localDateString(new Date(file.modifiedTime), timeZone);
    if (!byDay.has(day)) byDay.set(day, []);
    if (byDay.get(day).length < MAX_FILES_PER_DAY) byDay.get(day).push(file);
  }
  const dayKeys = [...byDay.keys()].sort().reverse().slice(0, 2);

  const days = [];
  for (const day of dayKeys) {
    const dayFiles = [];
    for (const file of byDay.get(day)) {
      try {
        dayFiles.push({ name: file.name, text: await fileText(file) });
      } catch (err) {
        dayFiles.push({ name: file.name, text: `[could not read: ${err.message}]` });
      }
    }
    days.push({ date: day, files: dayFiles });
  }

  const today = localDateString(new Date(), timeZone);
  return { reportDate: days[0].date, stale: days[0].date < today, days };
}
