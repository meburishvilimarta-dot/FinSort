import { connect } from "framer-api";

export async function connectToProject() {
  const projectUrl = process.env.FINA2_FRAMER_PROJECT_URL;
  const apiKey = process.env.FINA2_FRAMER_API_KEY;

  if (!projectUrl) {
    throw new Error("FINA2_FRAMER_PROJECT_URL is not set. Copy .env.example to .env and fill it in.");
  }
  if (!apiKey) {
    throw new Error("FINA2_FRAMER_API_KEY is not set. Copy .env.example to .env and fill it in.");
  }

  const framer = await connect(projectUrl, apiKey);
  const collections = await framer.getCollections();
  return { framer, collections };
}

// The blog collection's name on the fina2.net Framer project isn't known yet
// (see check-connection.mjs), so resolve it from FINA2_FRAMER_COLLECTION_NAME
// once that's been confirmed, rather than hardcoding a guess like "Journal".
export function resolveCollection(collections, name) {
  if (!name) {
    const available = collections.map((c) => c.name).join(", ") || "(none)";
    throw new Error(
      `FINA2_FRAMER_COLLECTION_NAME is not set. Run check-connection.mjs to see the available ` +
        `collections, then set it. Available: ${available}`
    );
  }
  const collection = collections.find(
    (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
  if (!collection) {
    const available = collections.map((c) => c.name).join(", ") || "(none)";
    throw new Error(`No collection named "${name}" found. Available: ${available}`);
  }
  return collection;
}

// Draft posts refer to logical fields ("title", "content", ...) but the
// collection's actual field names are whatever was typed in Framer, so match
// loosely by a list of accepted aliases per logical field.
export function matchField(fields, aliases) {
  return fields.find((f) => aliases.includes(f.name.trim().toLowerCase()));
}
