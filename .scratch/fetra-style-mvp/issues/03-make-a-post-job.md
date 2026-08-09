# 03 — Make a Post Job (Formats + AI image + Export)

**What to build:** Inside Brand Studio Posts (Blitz-like), a User can pick Brand + Product, choose a curated Format (`post` or `both`), run a Post Job that produces one AI-generated Instagram feed Post image (no caption), review phone-framed cards (accept/edit/export affordances), and Regenerate as a new credited job. Introduces the Format catalog used by later tickets.

**Blocked by:** 01 — Thin Brand + manual Product; 02b — Brand Studio shell

**Status:** ready-for-agent

- [x] Curated Format catalog exists with modality tags; Make a Post only lists `post` / `both`
- [x] Post Job creates from Brand + Product + Format, snapshots inputs, always AI-generates Post image (Product images condition the model)
- [x] No AI caption package is produced
- [x] Credits are checked and charged per Post Job; Regenerate starts a new Post Job with same inputs and charges again
- [x] User can preview in a phone frame and Export/download the image
- [x] Post Job application service tests use a fake image provider (no live OpenAI in unit tests)
