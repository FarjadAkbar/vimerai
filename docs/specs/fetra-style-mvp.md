## Problem Statement

Ecommerce brands need to ship Instagram feed creatives and short vertical videos fast — paste a product page, pick a proven viral format, get an asset they can post — without a multi-step Brand Kit studio, bundled storyboard/post/video generations, or AI caption packages they did not ask for. The current product still centers on Brand Kit + multi-arm Generation (and parked Phase C hardening), which is slower and differently shaped than competitors like Fetra. Users cannot scrape a product URL into a reusable Product, confirm a thin Brand, browse curated Formats, or run Make a Post and Make a Video as separate jobs with a Fetra-like create UX.

## Solution

Pivot Vimerai to a Fetra-style ecommerce create loop (ADR-0031): scrape or manually enter a Product (images + details saved as generation context), confirm a thin reusable Brand (name, logo, primary color, tone), pick a curated Format (tagged post / video / both), then run either a Post Job (AI Instagram feed image only) or a Video Job (~15–30s 9:16 for Reels or TikTok, file only). Modes are separate. Export downloads the media; no in-app publish and no AI captions in MVP. App create UX should feel like Fetra (paste link, format cards, phone preview). Regenerate starts a new job with the same inputs and charges again.

## User Stories

1. As a User, I want to paste a product page URL, so that Product name, description, and images are scraped without retyping.
2. As a User, I want scrape to work well on Shopify-like product pages first, so that the ecommerce happy path is reliable.
3. As a User, when scrape fails or I have no URL, I want to enter Product name, description, and images manually, so that I am never blocked from creating.
4. As a User, I want scraped or manual Product details saved to my account, so that later jobs reuse the same Product without re-entry.
5. As a User, I want Product images stored and used to condition AI Post images and Videos, so that outputs show my real product.
6. As a User, after Product entry, I want a Brand Confirm step for name, logo, primary color, and tone, so that outputs stay lightly on-brand without a full Brand Kit form.
7. As a User, I want Brand Confirm to save a reusable Brand, so that I do not re-confirm every time.
8. As a User, I want to pick an existing Brand instead of confirming from scratch, so that repeat creates stay fast.
9. As a User, I want Tone limited to Luxury, Professional, Playful, Bold, or Friendly, so that prompting stays consistent.
10. As a User, I want two clear create modes — Make a Post and Make a Video — so that I generate social image and video separately like Fetra.
11. As a User in Make a Post, I want to see only Formats tagged `post` or `both`, so that I pick patterns that fit feed images.
12. As a User in Make a Video, I want to see only Formats tagged `video` or `both`, so that I pick patterns that fit short video.
13. As a User, I want a curated Format library (owned cards such as meme CTA, problem-solution, listicle hook), so that I can recreate proven viral structures without live trend scraping.
14. As a User, I want Format cards presented in a browseable Fetra-like picker with phone preview affordances, so that the create studio feels familiar and fast.
15. As a User, I want a Post Job to produce one AI-generated Instagram feed Post image (not a Product-photo mode), so that the creative is designed, not a raw PDP shot.
16. As a User, I want Post Jobs to generate no AI caption package, so that I write captions myself outside the app.
17. As a User, I want to Export/download the Post image, so that I can upload it to Instagram manually.
18. As a User starting a Video Job, I want to choose Instagram Reels or TikTok, so that caption-less export still targets the right vertical surface.
19. As a User, I want a Video Job to produce one ~15–30s 9:16 Video file, so that the asset is a standard short without Length Tier complexity.
20. As a User, I want Video Jobs to generate no AI Reel caption, so that I write platform captions myself.
21. As a User, I want to Export/download the Video file, so that I can post it manually to Reels or TikTok.
22. As a User, I want Post Jobs and Video Jobs to snapshot Brand + Product + Format (and reel platform for Video) used, so that history stays honest if I edit Brand/Product later.
23. As a User, I want Regenerate to start a new Post Job or Video Job with the same Brand + Product + Format (+ platform), so that billing and history stay clear.
24. As a User, I want Regenerate to charge credits again, so that expensive AI reruns are metered.
25. As a User, I want credit checks before starting a Post Job or Video Job, so that I know cost before spending.
26. As a User, I want a library of past Post Jobs and Video Jobs, so that I can reopen, preview, export, or regenerate.
27. As a User, I want job progress that shows status through to a phone-style preview, so that waiting feels like a create studio not a bare spinner.
28. As a User with no Brand or Product yet, I want empty states that start from paste URL or Make a Post / Make a Video, so that I am not forced through the old Brand Kit gate.
29. As a User, I want Brand Kit, multi-arm Generation, storyboard, Posts-only concepts, Goals, Length Tiers, and caption editors removed or hidden from the MVP path, so that the product matches the Fetra-style loop.
30. As a User, I want my Brands, Products, Post Jobs, and Video Jobs owned only by my User account, so that MVP stays simple without Workspaces.
31. As a User, I want publish/schedule to social APIs unavailable in MVP, so that delivery stays Export-only and honest.
32. As a User, I want no live “recreate this viral URL” or trending feed scrape in MVP, so that Formats stay a curated owned library.
33. As a returning User, I want to start Make a Post or Make a Video from an existing Product without scraping again, so that weekly content is fast.
34. As a User, I want failed Post Jobs or Video Jobs to show a clear error and allow starting again, so that I am not stuck on a dead job.
35. As a developer agent, I want Post Job and Video Job application seams with modality providers faked in tests, so that the pivot is verified without calling OpenAI/fal in unit tests.
36. As a developer agent, I want a Product scrape port tested against fixture HTML, so that storefront adapters can swap without rewriting job logic.
37. As a User, I want the create app UX (not the marketing site) to be the Fetra-likeness priority, so that the product loop ships before landing-page polish.
38. As a User on a free or paid plan, I want plan limits to apply per Post Job and Video Job, so that billing maps to the new job types.
39. As a User, I want logo upload during Brand Confirm, so that Brand identity includes a real mark.
40. As a User, I want primary color selectable or scraped-then-editable during Brand Confirm, so that AI visuals can lean on brand color.
41. As a User viewing a completed Post Job, I want a phone-framed preview of the Post image, so that the result feels feed-native.
42. As a User viewing a completed Video Job, I want in-app playback of the Video in a phone frame, so that I can judge the reel before Export.
43. As a User, I want clear separation between Post Job history and Video Job history (or clearly typed entries), so that there is no Generation umbrella in the product language.
44. As a User, I want Product source URL retained when scraped, so that I can reopen the PDP and trust provenance.
45. As a User, I want multiple Product images supported on one Product, so that conditioning has more than a single shot.
46. As an agent implementing this, I want CONTEXT.md and ADR-0031 vocabulary used in APIs and UI copy (Brand, Product, Format, Post Job, Video Job, Export), so that the domain stays consistent.

## Implementation Decisions

### Seams and modules

- Replace the primary create orchestration seam: stop treating `IGenerationService` as the user-facing umbrella. Introduce **Post Job** and **Video Job** application services (ports) as the two create seams. Controllers and UI call these for create, list, get, regenerate, and export metadata.
- Keep `IImageGenerationProvider` for Post Job image generation (always AI in MVP; Product images as conditioning).
- Keep `IVideoGenerationProvider` for Video Job renders (~15–30s target). Promo stitch / Length Tier Teaser-Promo UX is not required for MVP Video Jobs.
- Keep `IStorageService` for Brand/Product assets and job output media (public HTTPS URLs as required for fal).
- Keep subscription/credit gating; meter **per Post Job** and **per Video Job** (including regenerate-as-new-job). Exact credit weights are an implementation choice but must be explicit and tested at the job seams.
- Add `IProductScrapeProvider` (or equivalent scrape port): input URL → structured Product fields (name, description, image URLs) or a typed failure. Adapters may start with Shopify-like HTML; tests use fixture HTML, not live sites.
- Evolve Brand Kit service into thin **Brand** CRUD aligned to Brand Confirm fields (name, logo, primary color, tone). Drop audience / things-to-avoid / multi-color Brand Kit requirements from the MVP create path.
- Extend Product service: create/update from scrape or manual input; **do not** require Brand Kit links to create a Product for the MVP loop. Jobs take explicit Brand id + Product id.
- Add a **Format** catalog module (read-mostly curated data): id, label, description, modality tags (`post` | `video` | `both`), and prompt/structure payload used by job services. No user-authored Formats in MVP.
- Prefer existing modality/storage/subscription ports over new mega-AI ports. Do not add platform publish adapters.
- Frontend: Fetra-like create studio routes for Make a Post / Make a Video (paste URL or pick Product → Brand Confirm → Format cards → job progress → phone preview → Export). Hide or remove Brand Kit–gated multi-arm Generation UX from the primary path.

### Domain and schema (logical)

- User-owned: Brand, Product, Asset, Format (catalog; not user-owned), Post Job, Video Job, credit usage.
- Post Job stores: status, Brand snapshot, Product snapshot, Format id/snapshot, Post image URL, timestamps, credit charge reference.
- Video Job stores: status, Brand snapshot, Product snapshot, Format id/snapshot, reel platform (Instagram Reels | TikTok), Video URL, duration target metadata, timestamps, credit charge reference.
- Product stores: name, description, images, source URL (nullable), optional price.
- Brand stores: name, logo URL, primary color, tone.
- No Workspace/team tables.
- No Generation umbrella entity required for new work; migrate or leave legacy Generation tables read-only/hidden until a later cleanup ticket.
- Strong TypeScript: no `any`; shared shapes in `types` folders.

### API / product contracts

- Product scrape: authenticated endpoint accepting URL → preview fields; user confirms to persist Product (or scrape-and-save in one step if UX prefers — prefer confirm-to-save if scrape quality varies).
- Brand Confirm: create/update Brand with four fields; logo upload remains available.
- List Formats filtered by mode (`post` | `video`).
- Create Post Job: Brand id + Product id + Format id → async/sync job returning Post image when complete.
- Create Video Job: Brand id + Product id + Format id + reel platform → job returning Video URL when complete.
- Regenerate: POST on a completed job that creates a **new** job with cloned inputs and charges again.
- Export: client downloads media URLs (signed or public); no publish APIs.
- Prompt / conditioning: Brand + Product + Format structure drive image/video providers; no caption/text package outputs for MVP jobs.
- UI copy and API resource names should prefer Post Job / Video Job / Brand / Format vocabulary from CONTEXT.md.

### Provider and ADR notes

- ADR-0031 is the product direction; Phase 1 / Phase C roadmap ADRs are historical until code migrates.
- ADR-0023 remains: Export only, no Meta/TikTok publish.
- ADR-0026’s “one Generation seam” is superseded for new work by dual Post Job / Video Job seams; modality provider split remains.
- ADR-0015 vendor split (OpenAI-style image/text vs fal video) may continue unless a later ADR changes it; Post Jobs need image generation always-on.
- ADR-0016 (Product photo default Post image) is superseded for MVP by always AI Post image.
- Curated Formats only — no trend ingest ToS risk in MVP.

## Testing Decisions

- Good tests assert external behavior at application seams (inputs/outputs, credits charged, snapshots stored, status transitions), not private helpers or prompt string internals.
- Primary modules under test:
  - Post Job application service (fake `IImageGenerationProvider`, fake repos, stub subscription).
  - Video Job application service (fake `IVideoGenerationProvider`, fake repos, stub subscription).
  - Product scrape port (fixture HTML → structured fields / failures).
  - Brand and Product services for thin Brand Confirm and scrape/manual Product persistence without Brand Kit link gate.
  - Format catalog filtering by modality tag.
- Prior art: `generation.service.spec.ts` with in-memory repos and fake modality providers; Brand Kit / Product service specs; `phase1-product-path.contract.spec.ts` style contract guards — add a Fetra-path contract that primary create UX does not depend on multi-arm Generation / Brand Kit gate.
- Do not require live OpenAI/fal or live Shopify HTTP in unit/integration tests.
- Controller e2e and Playwright are optional follow-ups, not the primary seam for this spec.

## Out of Scope

- In-app publish, schedule, or social account connection
- Live trending feed / swipe browse of third-party viral posts
- “Recreate from this post/video URL” analysis
- AI caption packages for Post or Video
- Reel Storyboard, Creative Brief multi-arm bundle, Posts-only Post Concepts
- Goals and Length Tier (Teaser/Promo) user controls
- Full former Brand Kit fields (audience, things-to-avoid, secondary colors, AI instructions) as required MVP
- Workspace / team / org
- Marketing-site lookalike as a prerequisite to the create app UX
- Buying/warming social accounts (Fetra upsell)
- SEO/GEO or paid-ads “AI employees” surfaces
- Facebook/X feed posts; YouTube Shorts as a first-class platform picker
- Manual “use Product photo” Post image mode
- Soft memory / chat agent memory beyond the saved Product record
- Exact credit price table / Stripe plan redesign (beyond metering per job)

## Further Notes

- Glossary source of truth: root `CONTEXT.md`. Decision record: `docs/adr/0031-fetra-style-mvp-pivot.md`.
- This spec intentionally parks a large amount of existing Phase 1 code; implementation may feature-flag or hide legacy routes rather than delete everything in the first slice — but the **user-facing MVP path** must be the Fetra-style loop only.
- Suggested first implementation slices (for a later `/to-tickets` pass): (1) thin Brand + Product scrape/manual without Brand Kit gate, (2) Format catalog + Make a Post Job + Export, (3) Make a Video Job + platform picker + Export, (4) Fetra-like create UX chrome (format cards, phone preview), (5) hide/retire multi-arm Generation primary path.
- Credit weights for Post Job vs Video Job should be decided at ticket time with a short ADR only if the ratio is surprising or hard to reverse.
