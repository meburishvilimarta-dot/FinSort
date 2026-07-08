---
description: Write the next Journal blog post draft for Maison Metekhi
---

Follow `CLAUDE.md` exactly for brand voice, structure, and length (500-800
words, clean HTML body).

1. Read `topics.txt` for the ordered list of post topics.
2. Read every file in `/drafts` and `/drafts/published`, and collect their
   `topic:` frontmatter values.
3. Pick the first topic in `topics.txt` that has no matching draft yet. If
   every topic already has a draft, say so and stop — never repeat a topic.
4. Write the post as clean semantic HTML per `CLAUDE.md`: `<h2>`, `<p>`,
   `<ul>`/`<li>`, `<strong>`/`<em>` as needed. No `<html>`/`<head>`/`<body>`
   wrapper, no inline styles, no markdown syntax.
5. Choose a short kebab-case slug and write a one-sentence excerpt.
6. Save the result to `/drafts/YYYY-MM-DD-<slug>.md` (today's date) with
   exactly this frontmatter format, followed by the HTML body:

   ```
   ---
   title: <post title>
   slug: <slug>
   excerpt: <one sentence>
   topic: <topic text exactly as it appears in topics.txt>
   date: YYYY-MM-DD
   ---
   <HTML body>
   ```

7. Tell me which topic you picked, the file path, and the word count.
