# Maison Metekhi — Journal Blog

This repo auto-generates weekly blog posts for **Maison Metekhi**, a boutique
hotel in Old Town Tbilisi, and publishes them as draft items into the
**Journal** CMS collection on the Framer site (divine-material-436635.framer.app).

## Brand voice

- **Persona**: a boutique hotelier who genuinely loves the neighborhood —
  warm, welcoming, personal, never corporate or salesy.
- **Tone**: like a knowledgeable friend giving a recommendation, not an ad.
  Confident and specific (name real streets, dishes, wines) rather than
  generic travel-blog filler ("a hidden gem," "must-see," "vibrant
  atmosphere" are banned phrases).
- **POV**: mostly second person ("you'll find...") with occasional first
  person plural ("we love sending guests to...") to remind the reader this
  is written by the hotel.
- **Avoid**: superlative-stuffed listicle voice, emoji, exclamation points
  used more than once or twice a post, hashtags.

## Topics

Posts should cover one of these areas, tied back to Old Town Tbilisi and,
where natural, a soft mention of Maison Metekhi (never a hard sell):

1. Neighborhood guides (Old Town streets, squares, courtyards, viewpoints)
2. Local food and wine (qvevri wine, Georgian dishes, markets, bakeries, cafes)
3. Nearby sights (churches, the Narikala fortress, the sulphur baths, the
   Bridge of Peace, museums, day trips)
4. Hotel features (rooms, breakfast, terrace, service touches) — used
   sparingly, roughly 1 in 4 posts at most

## Format

- **Length**: 500–800 words.
- **Output**: clean semantic HTML only — `<h2>`, `<p>`, `<ul>`/`<li>`,
  `<strong>`/`<em>` as needed. No `<html>`, `<head>`, or `<body>` wrapper,
  no inline styles, no markdown syntax, no `<script>`.
- **Structure**: a short opening paragraph that sets the scene, 2–4 `<h2>`
  sections, a short closing paragraph. One clear takeaway per section.
- **Title**: specific and concrete, not clickbait.
- **Excerpt**: one sentence, written for a collection list preview.
- **Slug**: short, kebab-case, derived from the title.

## Files

- `topics.txt` — ordered list of post ideas, one per line. `/write-post`
  picks the first topic without an existing draft.
- `/drafts` — generated posts as Markdown files with YAML frontmatter and
  an HTML body (see `/write-post` command for the exact format).
- `/drafts/published` — drafts that have already been pushed to Framer,
  moved here by `/publish-post` so they're never re-published.
- `scripts/framer-client.mjs` — shared Framer Server API connection helper.
- `scripts/check-connection.mjs` — verifies the Framer connection and
  prints the Journal collection's real field names.
- `scripts/publish-post.mjs` — pushes the newest `/drafts` post into the
  Journal collection as a **draft item** (`draft: true`, never live).

## Framer connection

Integration uses Framer's official `framer-api` npm package (the Server
API) rather than a live MCP connector — see `.env.example` for the two
required environment variables (`FRAMER_API_KEY`, `FRAMER_PROJECT_URL`).
