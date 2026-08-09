# 02a — URL → Business DNA / Brand Overview

**What to build:** An authenticated User pastes a business/homepage URL, sees a generating/loading experience, and gets a persisted Brand with Business DNA (Brand Overview + Business Details). CTA hands off into Brand Studio (“Start Viral Growth” equivalent). Distinct from ticket 02 (Product PDP scrape).

**Blocked by:** 01 — Thin Brand + manual Product (no Brand Kit gate)

**Status:** in-progress (vertical slice shipped on `feat/fetra-brand-dna-from-url`)

- [x] Authenticated endpoint accepts a homepage/business URL and returns a persisted Brand with Business DNA fields
- [x] Homepage scrape + LLM structuring seam is tested with fixtures/fakes (no live site or live LLM in unit tests)
- [x] Loading UX communicates analysis progress (e.g. learning tone of voice) before Brand Overview
- [x] Brand Overview shows name, URL, logo, typography, colors, tagline, values, aesthetic, tone, image style, writing style
- [x] Business Details shows industry, primary language, elevator pitch, audience/selling points
- [x] Thin Brand Confirm / manual Brand create remains available as fallback
- [x] Handoff CTA into Brand Studio (Make a Post / Make a Video)
- [x] UI copy uses Business DNA / Brand Overview — not Brand Kit
- [ ] Polish: site screenshot preview during loading; logo download/upload from scraped URL; editable DNA fields before persist
