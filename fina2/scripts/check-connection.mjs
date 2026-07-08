import { connectToProject, resolveCollection } from "./framer-client.mjs";

async function main() {
  const { framer, collections } = await connectToProject();
  try {
    const info = await framer.getProjectInfo();
    console.log(`Connected to Framer project: ${info.name}`);
    console.log("Collections in this project:");
    for (const c of collections) {
      console.log(`  - ${c.name}`);
    }

    const wantedName = process.env.FINA2_FRAMER_COLLECTION_NAME;
    if (!wantedName) {
      console.log(
        "\nFINA2_FRAMER_COLLECTION_NAME is not set, so the blog collection above was not " +
          "inspected further. Set it to one of the collection names above and re-run."
      );
      return;
    }

    const collection = resolveCollection(collections, wantedName);
    const fields = await collection.getFields();
    const items = await collection.getItems();

    console.log(`\nBlog collection: "${collection.name}" (${items.length} existing item(s))`);
    console.log("Fields:");
    for (const f of fields) {
      console.log(`  - ${f.name}  [${f.type}]`);
    }
    console.log("Items:");
    for (const item of items) {
      console.log(`  - slug: ${item.slug}  draft: ${item.draft}  id: ${item.id}`);
    }
  } finally {
    await framer.disconnect();
  }
}

main().catch((err) => {
  console.error("Connection check failed:", err.message);
  process.exitCode = 1;
});
