# 04 — Make a Video Job (Formats + platform + Export)

**What to build:** Inside Brand Studio Videos (Viral Remix–like or simpler), a User can pick Brand + Product, choose a Format (`video` or `both`), pick Instagram Reels or TikTok, run a Video Job for a ~15–30s 9:16 Video (no caption), preview playback, Export/download, and Regenerate as a new credited job. Video Director chat remains parked.

**Blocked by:** 01 — Thin Brand + manual Product; 02b — Brand Studio shell; 03 — Make a Post Job (Format catalog)

**Status:** ready-for-agent

- [ ] Make a Video lists only Formats tagged `video` / `both`
- [ ] Video Job accepts Brand + Product + Format + reel platform; snapshots inputs; yields ~15–30s 9:16 Video file
- [ ] No AI Reel caption is produced
- [ ] Credits charged per Video Job; Regenerate creates a new Video Job with same inputs and charges again
- [ ] User can play the Video in a phone frame and Export/download the file
- [ ] Video Job application service tests use a fake video provider (no live fal in unit tests)
