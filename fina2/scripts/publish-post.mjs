import { mkdir, readdir, readFile, rename, stat } from "node:fs/promises";
import path from "node:path";
import { connectToProject, resolveCollection, matchField } from "./framer-client.mjs";

const DRAFTS_DIR = path.join(process.cwd(), "fina2", "drafts");
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
    console.log("No drafts found in /fina2/drafts. Run the fina2 write-post flow first.");
    return;
  }

  const raw = await readFile(newest.full, "utf8");
  const { data, body } = parseFrontmatter(raw);
  if (!data.title || !data.slug) {
    throw new Error(`Draft ${newest.name} is missing required "title" or "slug" frontmatter.`);
  }

  const { framer, collections } = await connectToProject();
  try {
    const collection = resolveCollection(collections, process.env.FINA2_FRAMER_COLLECTION_NAME);
    const fields = await collection.getFields();

    // Framer CMS items have no version history - an accidental overwrite of an
    // existing slug is unrecoverable, so refuse rather than silently colliding.
    const existingItems = await collection.getItems();
    if (existingItems.some((item) => item.slug === data.slug)) {
      throw new Error(
        `An item with slug "${data.slug}" already exists in "${collection.name}". Refusing to ` +
          "risk an overwrite - rename the draft's slug and retry."
      );
    }

    // The "Blogs" collection is shared with event listings (Summit 2024/2025,
    // etc.), so its real field names are prefixed accordingly rather than
    // generic "title"/"content"/"date" - confirmed via check-connection.mjs.
    const titleField = matchField(fields, ["blog title", "title", "name"]);
    const excerptField = matchField(fields, ["excerpt", "summary", "description"]);
    const contentField = matchField(fields, ["blog content", "content", "body", "post content", "post"]);
    const dateField = matchField(fields, ["publication date", "date", "published date", "publish date"]);
    const topicField = matchField(fields, ["topic"]);
    const imageField = matchField(fields, ["blog image", "image", "illustration", "photo", "picture", "cover image"]);
    const typeField = matchField(fields, ["type"]);

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
    if (imageField && data.image) {
      fieldData[imageField.id] = { type: "image", value: data.image, alt: data.title };
    }
    // Existing "Blogs" items distinguish posts from events via this enum.
    // addItems() rejects a display name here ("Expected a valid enum case,
    // got: [object Object]") - it needs the case's real id, which is only
    // visible via the EnumField.cases getter, not the display value seen
    // when reading existing items' fieldData.
    if (typeField) {
      const blogCase = typeField.cases?.find((c) => c.name.trim().toLowerCase() === "blog");
      if (!blogCase) {
        throw new Error(
          `Type field has no "Blog" case. Available: ${(typeField.cases ?? []).map((c) => c.name).join(", ")}`
        );
      }
      fieldData[typeField.id] = { type: "enum", value: blogCase.id };
    }

    await collection.addItems([{ slug: data.slug, draft: true, fieldData }]);

    // addItems() only acknowledges the write over the plugin connection; Framer
    // ingests any external image URL asynchronously afterward, so confirm the
    // item actually persisted before disconnecting or moving the draft file.
    const deadline = Date.now() + 20_000;
    let persisted = false;
    while (Date.now() < deadline) {
      const items = await collection.getItems();
      if (items.some((item) => item.slug === data.slug)) {
        persisted = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    }

    if (!persisted) {
      throw new Error(
        `addItems() did not throw, but slug "${data.slug}" never appeared in the collection after 20s. ` +
          "Not moving the draft to fina2/drafts/published so it can be retried."
      );
    }

    console.log(`Published "${data.title}" to the "${collection.name}" collection as a DRAFT item (slug: ${data.slug}).`);
  } finally {
    await framer.disconnect();
  }

  await mkdir(PUBLISHED_DIR, { recursive: true });
  await rename(newest.full, path.join(PUBLISHED_DIR, newest.name));
  console.log(`Moved ${newest.name} to fina2/drafts/published/.`);
}

main().catch((err) => {
  console.error("Failed to publish post:", err.message);
  process.exitCode = 1;
});
