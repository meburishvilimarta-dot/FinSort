import { mkdir, readdir, readFile, rename, stat } from "node:fs/promises";
import path from "node:path";
import { connectToJournal, matchField } from "./framer-client.mjs";

const DRAFTS_DIR = path.join(process.cwd(), "drafts");
const PUBLISHED_DIR = path.join(DRAFTS_DIR, "published");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('Draft is missing YAML frontmatter (a leading "--- ... ---" block).');
  }
  const [, frontmatter, body] = match;
  const data = {};
  for (const line of frontmatter.split("\n")) {
    if (!line.trim()) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { data, body: body.trim() };
}

async function findNewestDraft() {
  await mkdir(DRAFTS_DIR, { recursive: true });
  const entries = await readdir(DRAFTS_DIR, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile() && e.name.endsWith(".md"));
  if (files.length === 0) return null;

  const withStats = await Promise.all(
    files.map(async (f) => {
      const full = path.join(DRAFTS_DIR, f.name);
      const s = await stat(full);
      return { name: f.name, full, mtime: s.mtimeMs };
    })
  );
  withStats.sort((a, b) => b.mtime - a.mtime);
  return withStats[0];
}

async function main() {
  const newest = await findNewestDraft();
  if (!newest) {
    console.log("No drafts found in /drafts. Run /write-post first.");
    return;
  }

  const raw = await readFile(newest.full, "utf8");
  const { data, body } = parseFrontmatter(raw);
  if (!data.title || !data.slug) {
    throw new Error(`Draft ${newest.name} is missing required "title" or "slug" frontmatter.`);
  }

  const { framer, collection } = await connectToJournal();
  try {
    const fields = await collection.getFields();

    const titleField = matchField(fields, ["title", "name"]);
    const excerptField = matchField(fields, ["excerpt", "summary", "description"]);
    const contentField = matchField(fields, ["content", "body", "post content", "post"]);
    const dateField = matchField(fields, ["date", "published date", "publish date"]);
    const topicField = matchField(fields, ["topic"]);

    const fieldData = {};
    if (titleField) fieldData[titleField.id] = { type: titleField.type, value: data.title };
    if (excerptField && data.excerpt) {
      fieldData[excerptField.id] = { type: excerptField.type, value: data.excerpt };
    }
    if (contentField) {
      fieldData[contentField.id] = { type: "formattedText", value: body, contentType: "html" };
    }
    if (dateField && data.date) fieldData[dateField.id] = { type: dateField.type, value: data.date };
    if (topicField && data.topic) fieldData[topicField.id] = { type: topicField.type, value: data.topic };

    await collection.addItems([{ slug: data.slug, draft: true, fieldData }]);

    console.log(`Published "${data.title}" to the Journal collection as a DRAFT item (slug: ${data.slug}).`);
  } finally {
    await framer.disconnect();
  }

  await mkdir(PUBLISHED_DIR, { recursive: true });
  await rename(newest.full, path.join(PUBLISHED_DIR, newest.name));
  console.log(`Moved ${newest.name} to drafts/published/.`);
}

main().catch((err) => {
  console.error("Failed to publish post:", err.message);
  process.exitCode = 1;
});
