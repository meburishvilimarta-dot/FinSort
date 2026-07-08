import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DRAFTS_DIR = path.join(ROOT, "drafts");
const PUBLISHED_DIR = path.join(DRAFTS_DIR, "published");
const TOPICS_FILE = path.join(ROOT, "topics.txt");
const CLAUDE_MD_FILE = path.join(ROOT, "CLAUDE.md");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  const [, frontmatter] = match;
  const data = {};
  for (const line of frontmatter.split("\n")) {
    if (!line.trim()) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return data;
}

async function usedTopics() {
  const used = new Set();
  for (const dir of [DRAFTS_DIR, PUBLISHED_DIR]) {
    await mkdir(dir, { recursive: true });
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      const raw = await readFile(path.join(dir, entry.name), "utf8");
      const data = parseFrontmatter(raw);
      if (data?.topic) used.add(data.topic.trim());
    }
  }
  return used;
}

async function pickTopic() {
  const raw = await readFile(TOPICS_FILE, "utf8");
  const topics = raw.split("\n").map((line) => line.trim()).filter(Boolean);
  const used = await usedTopics();
  return topics.find((topic) => !used.has(topic)) ?? null;
}

async function generateDraft(topic, brandVoice) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  const prompt = `You are writing the next weekly Journal blog post for Maison Metekhi, a boutique hotel in Old Town Tbilisi. Follow this project's brand voice, topic, and format rules exactly:

${brandVoice}

Write today's post on exactly this topic: "${topic}"

Respond with ONLY a JSON object (no markdown code fences, no commentary before or after) with these keys:
{
  "title": "specific, concrete title, not clickbait",
  "slug": "short-kebab-case-slug derived from the title",
  "excerpt": "one sentence written for a collection list preview",
  "html": "the full HTML body: <h2>, <p>, <ul>/<li>, <strong>/<em> as needed, no <html>/<head>/<body> wrapper, no inline styles, no markdown syntax, 500-800 words, a short opening paragraph, 2-4 <h2> sections, a short closing paragraph"
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text = data.content?.find((block) => block.type === "text")?.text;
  if (!text) {
    throw new Error("No text content in Anthropic response.");
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Could not find a JSON object in the model response:\n${text}`);
  }
  return JSON.parse(jsonMatch[0]);
}

async function main() {
  const topic = await pickTopic();
  if (!topic) {
    console.log("Every topic in topics.txt already has a draft. Add more topics before running again.");
    return;
  }

  const brandVoice = await readFile(CLAUDE_MD_FILE, "utf8");
  const post = await generateDraft(topic, brandVoice);

  const date = new Date().toISOString().slice(0, 10);
  const filename = `${date}-${post.slug}.md`;
  const filepath = path.join(DRAFTS_DIR, filename);

  const frontmatter = [
    "---",
    `title: ${post.title}`,
    `slug: ${post.slug}`,
    `excerpt: ${post.excerpt}`,
    `topic: ${topic}`,
    `date: ${date}`,
    "---",
  ].join("\n");

  await mkdir(DRAFTS_DIR, { recursive: true });
  await writeFile(filepath, `${frontmatter}\n${post.html.trim()}\n`, "utf8");

  console.log(`Picked topic: ${topic}`);
  console.log(`Wrote draft to ${filepath}`);
}

main().catch((err) => {
  console.error("Failed to generate post:", err.message);
  process.exitCode = 1;
});
