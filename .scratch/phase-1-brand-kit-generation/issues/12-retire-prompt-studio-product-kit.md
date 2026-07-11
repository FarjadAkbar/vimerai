# 12 — Contract: retire Prompt Studio + Product Kit

**What to build:** Remove Prompt Studio and filesystem Product Kit from the product path; all Generations go through Brand Kit + Product + Generation seam.

**Blocked by:** 04 — Teaser Generation happy path; 11 — Generation library

**Status:** ready-for-agent

- [ ] Prompt Studio removed from nav and consumer API/UI
- [ ] Filesystem Product Kit no longer sources Generation
- [ ] Old generate entry points cut over or removed
- [ ] App boots and Generate works without ACTIVE_KIT / kit folder
- [ ] Smoke tests / checks confirm no product dependency on deprecated paths
