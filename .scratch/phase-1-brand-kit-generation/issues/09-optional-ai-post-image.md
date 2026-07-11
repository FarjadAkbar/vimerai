# 09 — Optional AI Post image

**What to build:** User can opt into AI Post image (conditioned on Product images) instead of Product photo; cost is not free like text regen.

**Blocked by:** 04 — Teaser Generation happy path

**Status:** ready-for-agent

- [ ] Options: Product photo (default) vs AI Post image
- [ ] AI image uses Product images as conditioning via image provider
- [ ] AI Post image incurs surcharge / credits (not free text regen)
- [ ] Social Post shows resulting Post image; export works
- [ ] Tests fake image provider and assert billing difference
