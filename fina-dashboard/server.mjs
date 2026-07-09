// Local dev server — mirrors the Vercel layout: /api/* routes to the
// serverless handlers, everything else is served from /public.
// Usage: `node server.mjs` (loads .env if present).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

// Tiny .env loader so local dev needs no dependencies.
const envFile = path.join(here, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const routes = {
  "/api/kpis": (await import("./api/kpis.js")).default,
  "/api/intel": (await import("./api/intel.js")).default,
  "/api/suggestions": (await import("./api/suggestions.js")).default,
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const route = routes[url.pathname];
  if (route) {
    try {
      await route(req, res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.writeHead(500);
      res.end(JSON.stringify({ error: "Internal error" }));
    }
    return;
  }

  const rel = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  const file = path.join(here, "public", path.normalize(rel));
  if (!file.startsWith(path.join(here, "public")) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => console.log(`FINA dashboard: http://localhost:${port}`));
