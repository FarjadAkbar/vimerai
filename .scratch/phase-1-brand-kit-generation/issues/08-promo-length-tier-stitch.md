# 08 — Promo Length Tier (stitch)

**What to build:** User can choose Promo in Options; Generation queues a ~60s Video by stitching beat-aligned Shots; higher weighted credits; Storyboard scoped to Promo length.

**Blocked by:** 04 — Teaser Generation happy path; 07 — Partial success + failed-arm retry

**Status:** done

- [x] Options expose Teaser vs Promo Length Tier
- [x] Promo charges higher weighted credits than Teaser
- [x] Promo Video assembled from beat-aligned Shots (stitch)
- [x] Progress/queued UX acceptable for longer run
- [x] Partial failure of individual Shots works with retry from 07
- [x] Tests cover credit weight and stitch orchestration with fakes
