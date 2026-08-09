# 03 — Make a Post Job (Formats + AI image + Export)

**What to build:** A User can run Make a Post: pick Brand + Product, choose a curated Format (`post` or `both`), run a Post Job that produces one AI-generated Instagram feed Post image (no caption), see a phone-style preview, Export/download the image, and Regenerate as a new credited job. Introduces the Format catalog used by later tickets. Create UX should feel Fetra-like (format cards, phone preview).

**Blocked by:** 01 — Thin Brand + manual Product (no Brand Kit gate)

**Status:** ready-for-agent

- [ ] Curated Format catalog exists with modality tags; Make a Post only lists `post` / `both`
- [ ] Post Job creates from Brand + Product + Format, snapshots inputs, always AI-generates Post image (Product images condition the model)
- [ ] No AI caption package is produced
- [ ] Credits are checked and charged per Post Job; Regenerate starts a new Post Job with same inputs and charges again
- [ ] User can preview in a phone frame and Export/download the image
- [ ] Post Job application service tests use a fake image provider (no live OpenAI in unit tests)
