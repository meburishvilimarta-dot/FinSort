import { connect } from "framer-api";

export async function connectToJournal() {
  const projectUrl = process.env.FRAMER_PROJECT_URL;
  const apiKey = process.env.FRAMER_API_KEY;
  const collectionName = process.env.FRAMER_COLLECTION_NAME || "Journal";

  if (!projectUrl) {
    throw new Error("FRAMER_PROJECT_URL is not set. Copy .env.example to .env and fill it in.");
  }
  if (!apiKey) {
    throw new Error("FRAMER_API_KEY is not set. Copy .env.example to .env and fill it in.");
  }

  const framer = await connect(projectUrl, apiKey);
  const collections = await framer.getCollections();
  const collection = collections.find(
    (c) => c.name.trim().toLowerCase() === collectionName.trim().toLowerCase()
  );

  if (!collection) {
    const available = collections.map((c) => c.name).join(", ") || "(none)";
    await framer.disconnect();
    throw new Error(`No collection named "${collectionName}" found. Available: ${available}`);
  }

  return { framer, collection };
}

// Draft posts refer to logical fields ("title", "content", ...) but the
// Journal collection's actual field names are whatever the user typed in
// Framer, so match loosely by a list of accepted aliases per logical field.
export function matchField(fields, aliases) {
  return fields.find((f) => aliases.includes(f.name.trim().toLowerCase()));
}
