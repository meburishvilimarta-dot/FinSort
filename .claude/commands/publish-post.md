---
description: Publish the newest /drafts post to Framer's Journal collection as a draft item
---

Run `node scripts/publish-post.mjs` to push the newest file in `/drafts` to
the Journal collection on Framer.

- The script maps frontmatter fields (title, excerpt, content, date, topic)
  onto the Journal collection's real field names and creates the item with
  `draft: true`, so it is saved but never goes live automatically.
- On success it moves the published file into `/drafts/published/` so it
  won't be picked up again.
- If it fails because `FRAMER_API_KEY` or `FRAMER_PROJECT_URL` is missing or
  wrong, tell me — those live in `.env` (see `.env.example`), never commit
  `.env` itself.
- Report the result: which post was published (title + slug), or the exact
  error if it failed.
