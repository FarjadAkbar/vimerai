# 07 — Partial success + failed-arm retry

**What to build:** If one Generation arm fails, keep successful Content Outputs; user can retry only failed arms without paying again for work that already succeeded.

**Blocked by:** 04 — Teaser Generation happy path

**Status:** ready-for-agent

- [ ] Per-arm status visible on Generation
- [ ] Successful arms remain available when another fails
- [ ] Retry failed arm does not re-charge for completed arms
- [ ] UI supports retry on failed arms
- [ ] Tests simulate mixed success/failure with fakes
