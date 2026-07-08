---
description: Publish the newest fina2/drafts post to fina2.net's Framer blog collection as a draft item
---

Framer API calls cannot run from this session (WebSocket egress is
blocked here — see `fina2/CLAUDE.md`). Instead:

1. Confirm the newest file in `fina2/drafts` is committed on `main`.
2. If it's not yet pushed, commit and push it — pushing a
   `fina2/drafts/*.md` file to `main` triggers the
   `.github/workflows/fina2-publish-draft.yml` GitHub Actions workflow,
   which runs `fina2/scripts/publish-post.mjs` with the `FINA2_FRAMER_*`
   repo secrets, polls to confirm the item actually persisted, and moves
   the file to `fina2/drafts/published/` on success.
3. Report the workflow run and, once it completes, the published post's
   title and slug — or the exact error if it failed.
