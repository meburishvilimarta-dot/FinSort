# SilkBridge — landing page

A single-file marketing landing page for a proposed platform connecting
Georgian companies with vetted talent in India and the Philippines
(development, support, back-office, etc.).

Everything lives in `index.html` — no build step, no dependencies. Fonts
(Instrument Serif, Public Sans, IBM Plex Mono) are embedded as base64
`@font-face` data URIs, so the page works fully offline and can be deployed
as a single static file to any host (Vercel, Netlify, S3, GitHub Pages).

## Running locally

Open `index.html` directly in a browser, or serve it:

```
npx serve outsourcing-platform
```

## What's real vs. placeholder

- Copy, structure, and the working-hours/route visualizations are real
  content, written for this idea specifically — not filler.
- The waitlist form at the bottom is front-end only (see the code comment
  in `index.html`'s `<script>` block). Wire the `#waitlist-form` submit
  handler to a real backend (Airtable, a spreadsheet via a serverless
  function, your CRM, etc.) before launch.
- Tax/regulatory claims about Georgia (Virtual Zone status, Small Business
  status, same-day company registration) are general, well-known facts
  about Georgia's business environment, flagged with a disclaimer in the
  page itself — verify current specifics with a local accountant/attorney
  before using them in anything binding.
- No fabricated testimonials, customer logos, or usage stats — the page is
  honest about being pre-launch/early access.

## Next steps if this becomes a real product

This is a marketing page, not the platform itself. Turning "SilkBridge"
into an actual two-sided marketplace (accounts, profiles, matching,
payments) would be a separate, much larger build — this page's job is to
validate interest and start collecting a waitlist.
