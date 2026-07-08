# FINA (fina2.net) — Blog Pipeline

This directory auto-generates a weekly blog post for **FINA**
(fina2.net), a SupTech/RegTech/BI software vendor trusted by regulators
and central banks in 14+ countries since 2006. Posts publish as draft
items into a Framer CMS collection on the fina2.net Framer project.

**Do not write posts about FINA's own products.** No product deep-dives,
no "the case for X platform" pieces, no posts whose premise is a named
FINA product. Posts should be independent industry/tech commentary that
happens to sit in FINA's field (SupTech, RegTech, BI, AI in financial
services, financial-sector software) — the kind of piece that gets read
and cited on its own merits, not because it's attached to a vendor. If a
FINA capability comes up, it's an incidental, one-clause mention inside
a point about the broader industry, never the subject of the post.

## Brand voice

- **Persona**: FINA's own regulatory-technology team — practitioners who
  have built systems used daily by central bank supervisors, not
  outside commentators.
- **Tone**: authoritative, precise, and calm. Confident use of correct
  regulatory and technical terminology (SupTech, RegTech, XBRL, RBAC,
  Basel/IFRS references where relevant) rather than vague hype. Never
  breathless marketing language.
- **POV**: third person / institutional ("FINA's platform...", "central
  banks increasingly need...") with occasional first person plural ("we
  see this most often when...") to show hands-on experience.
- **Avoid**: generic AI-hype filler ("game-changing," "revolutionize,"
  "unlock the power of"), unexplained acronyms, exclamation points,
  emoji, hashtags, hard sales pitches.

## Write for GEO (Generative Engine Optimization), not just SEO

These posts are written to be cited and summarized accurately by AI
answer engines (ChatGPT, Gemini, Perplexity, Claude), not only to rank
in classic search. That changes how each post should be built:

- **Define terms on first use.** State plainly what SupTech, RegTech, or
  a given regulation/standard means the first time it appears, in a
  self-contained sentence an LLM could quote directly.
- **Lead sections with the answer.** Open each `<h2>` section with a
  direct, extractable statement of the point, then support it — don't
  bury the conclusion at the end of the paragraph.
- **Use concrete numbers and named sources.** Cite real figures, named
  regulations, or named institutions/publications where genuinely true;
  never fabricate a statistic or citation. If you're not certain a
  number is accurate, describe the trend qualitatively instead of
  inventing a figure.
- **Structure for extraction.** Use `<ul>/<li>` for anything list-shaped
  (steps, criteria, comparisons) and short, self-contained paragraphs —
  these are what generative engines lift into answers.
- **Stay topically focused.** One clear subject per post, tied to a
  specific buyer question a regulator, central bank, or bank compliance
  team would actually ask.

## Topics

Posts should cover current, genuinely relevant developments in AI
regulation/compliance, open banking, cybersecurity, data governance, and
business intelligence as they apply to financial services and
regulators — the kind of thing a compliance officer, regulator, or bank
technology lead would actually search or ask an AI assistant about right
now, grounded in real, checkable sources (named regulations, named
research, named institutions). Not a FINA product pitch — see the
"do not write about FINA's own products" note above. A one-line mention
of FINA's general area of work (never a specific product) is fine in
roughly 1 in 4 posts, never a hard sell.

## Format

- **Length**: 600–900 words.
- **Output**: clean semantic HTML only — `<h2>`, `<p>`, `<ul>`/`<li>`,
  `<strong>`/`<em>` as needed. No `<html>`, `<head>`, or `<body>`
  wrapper, no inline styles, no markdown syntax, no `<script>`.
- **Structure**: a short opening paragraph naming the specific question
  or trend the post addresses, 3–4 `<h2>` sections each leading with a
  direct claim, a short closing paragraph.
- **Title**: specific and concrete, not clickbait.
- **Excerpt**: one sentence, written for a collection list preview.
- **Slug**: short, kebab-case, derived from the title.

## Files

- `fina2/topics.txt` — ordered list of post ideas, one per line. Pick
  the first topic without an existing draft.
- `fina2/drafts` — generated posts as Markdown files with YAML
  frontmatter and an HTML body (same frontmatter format as the root
  `/drafts` pipeline: `title`, `slug`, `excerpt`, `topic`, `date`,
  optional `image`).
- `fina2/drafts/published` — drafts already pushed to Framer, moved here
  so they're never re-published.
- `fina2/scripts/framer-client.mjs` — shared Framer Server API
  connection helper for the fina2.net project. Reads env vars named
  `FINA2_FRAMER_*`, but the GitHub Actions workflows currently populate
  `FINA2_FRAMER_API_KEY` / `FINA2_FRAMER_PROJECT_URL` from the **shared**
  `FRAMER_API_KEY` / `FRAMER_PROJECT_URL` repo secrets — the same ones
  the root Maison Metekhi pipeline uses (a deliberate, explicit choice to
  avoid adding new secrets; see the workflow files). This means only one
  Framer project's credentials can be live in those secrets at a time —
  running the fina2 pipeline currently leaves the Maison Metekhi pipeline
  pointed at the wrong project until the secrets are swapped back.
- `fina2/scripts/check-connection.mjs` — verifies the Framer connection,
  lists the project's collections, and (once
  `FINA2_FRAMER_COLLECTION_NAME` is set) prints that collection's real
  field names and existing items.
- `fina2/scripts/publish-post.mjs` — pushes the newest `fina2/drafts`
  post into the blog collection as a **draft item** (`draft: true`,
  never live), polling for up to 20s to confirm the item actually
  persisted before moving the file to `fina2/drafts/published/`.

## The "Blogs" collection is shared with events

Confirmed via `check-connection.mjs`: the collection named `Blogs` on the
fina2.net Framer project holds **both** blog posts and event listings
(e.g. "Summit 2024", "Summit 2025", a business-forum item), distinguished
by a `Type` enum field with plain string values `"Blog"` or `"Event"`.
`publish-post.mjs` always sets `Type: "Blog"` on items it creates — never
touch or overwrite existing items, and never change that value.

The real field names (not the generic ones the frontmatter/matchField
aliases assume) are: `Blog Title`, `Blog Content` (formattedText/HTML),
`Blog Image`, `Publication Date`. **There is no excerpt/summary field in
this collection** — `excerpt` is still written into each draft's
frontmatter for editorial purposes, but it currently has nowhere to go on
publish (silently skipped, not an error). There's also no `topic` field.

## Framer connection — GitHub Actions only

`framer-api` opens a WebSocket to `wss://api.framer.com`, which does not
work from this Claude Code Remote session (the egress proxy doesn't
support WebSocket upgrades). All Framer API calls for this pipeline run
in GitHub Actions instead — see `.github/workflows/fina2-check-connection.yml`
and `.github/workflows/fina2-publish-draft.yml`. Never attempt to run
`fina2/scripts/*.mjs` directly from an interactive Claude Code Remote
session; draft, commit, and push the `.md` file instead and let the
publish workflow handle the Framer side.
