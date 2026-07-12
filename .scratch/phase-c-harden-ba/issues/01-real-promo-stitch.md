# 01 — Real Promo stitch via fal merge

**What to build:** Promo Generations export and play one merged Video assembled from ordered beat Shots (fal merge-videos behind stitch), not the first beat alone; Shots remain for retry/regen.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Promo create sets Video URL to stitch/merge result distinct from a single first Shot
- [ ] Ordered beat Shots still stored and usable for failed-arm retry / Shot regenerate
- [ ] Shot regenerate on Promo re-stitches and updates Video URL
- [ ] Stitch failure fails Video arm while keeping completed Shots and other Content Outputs
- [ ] Tests fake video provider stitch calls and assert merge URL behavior at IGenerationService
