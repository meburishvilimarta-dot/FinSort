import { connectToJournal } from "./framer-client.mjs";

async function main() {
  const { framer, collection } = await connectToJournal();
  try {
    const info = await framer.getProjectInfo();
    const fields = await collection.getFields();
    const items = await collection.getItems();

    console.log(`Connected to Framer project: ${info.name}`);
    console.log(`Journal collection: "${collection.name}" (${items.length} existing item(s))`);
    console.log("Fields:");
    for (const f of fields) {
      console.log(`  - ${f.name}  [${f.type}]`);
    }
  } finally {
    await framer.disconnect();
  }
}

main().catch((err) => {
  console.error("Connection check failed:", err.message);
  process.exitCode = 1;
});
