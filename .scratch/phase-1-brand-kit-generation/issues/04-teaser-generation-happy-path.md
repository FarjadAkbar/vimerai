# 04 — Teaser Generation happy path

**What to build:** User picks Product + Goal → Generate and gets Creative Brief–driven Social Post (Product photo), Reel Storyboard (four beats), Reel caption, and Teaser Video; snapshot stored; Teaser credits charged; setup gate and empty states; Options defaults (Teaser, IG feed, IG Reels, Product photo).

**Blocked by:** 01 — Prefactor: Generation seam + modality ports; 03 — Product CRUD + Brand–Product links

**Status:** done

- [x] Generate blocked until Brand Kit + Product exist; empty states guide setup
- [x] Happy path only requires Product + Goal; defaults apply
- [x] Bundle: Social Post + Reel Storyboard + Video + Reel caption
- [x] Brand Kit/Product snapshot stored on Generation
- [x] Teaser weighted credit charged before/on create
- [x] Structured prompt layers used for text arms (OpenAI)
- [x] Teaser Video via video provider (fal); Product images condition when applicable
- [x] Tests via Generation seam with faked providers
