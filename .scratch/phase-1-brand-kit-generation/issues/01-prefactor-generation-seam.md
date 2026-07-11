# 01 — Prefactor: Generation seam + modality ports

**What to build:** Expand beside the current generator: Generation application seam plus text/image modality provider ports and shared types, without breaking existing fal video generate.

**Blocked by:** None — can start immediately.

**Status:** done

- [ ] Generation application seam exists and is injectable
- [ ] Text and image modality provider ports exist with strong types (no `any`)
- [ ] Existing fal video generate still works end-to-end
- [ ] Provider fakes usable in tests
- [ ] No cutover of Prompt Studio / Product Kit yet
