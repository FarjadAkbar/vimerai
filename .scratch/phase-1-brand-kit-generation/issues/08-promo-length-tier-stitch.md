# 08 — Promo Length Tier (stitch)

**What to build:** User can choose Promo in Options; Generation queues a ~60s Video by stitching beat-aligned Shots; higher weighted credits; Storyboard scoped to Promo length.

**Blocked by:** 04 — Teaser Generation happy path; 07 — Partial success + failed-arm retry

**Status:** ready-for-agent

- [ ] Options expose Teaser vs Promo Length Tier
- [ ] Promo charges higher weighted credits than Teaser
- [ ] Promo Video assembled from beat-aligned Shots (stitch)
- [ ] Progress/queued UX acceptable for longer run
- [ ] Partial failure of individual Shots works with retry from 07
- [ ] Tests cover credit weight and stitch orchestration with fakes
