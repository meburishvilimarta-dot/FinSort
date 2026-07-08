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
      if (f.type === "enum") {
        // `cases` is a getter on the SDK's EnumField class, so it's invisible
        // to JSON.stringify(f) - must access it directly to see real case ids.
        for (const c of f.cases ?? []) {
          console.log(`      case: id=${c.id}  name=${c.name}`);
        }
      }
    }

    const typeField = fields.find((f) => f.name.trim().toLowerCase() === "type");
    console.log("Items:");
    for (const item of items) {
      const typeValue = typeField ? item.fieldData?.[typeField.id] : undefined;
      console.log(
        `  - slug: ${item.slug}  draft: ${item.draft}  id: ${item.id}` +
          (typeField ? `  type: ${JSON.stringify(typeValue)}` : "")
      );
    }
  } finally {
    await framer.disconnect();
  }
}

main().catch((err) => {
  console.error("Connection check failed:", err.message);
  process.exitCode = 1;
});
