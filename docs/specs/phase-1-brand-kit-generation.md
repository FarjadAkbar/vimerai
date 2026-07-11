## Problem Statement

Ecommerce brands need to create marketing reels and social feed posts that match their brand voice, showcase real products, and are ready to post — without hiring a studio or fighting generic AI copy. Today the product can render short fal videos from a deprecated filesystem Product Kit, but users cannot own Brand Kits or Products, cannot get feed posts and reel storyboards alongside video, and cannot edit outputs cheaply. Prompt Studio and a global kit also fight consistent brand-driven generation.

## Solution

Phase 1 turns Vimerai into a Brand Kit–driven creative studio: users set up a Brand Kit and Products, then run one Generation that produces a feed Social Post (caption + Post image), a Reel Storyboard, and a marketing Video (with Reel caption) from a shared Creative Brief. Happy path is Product → Goal → Generate with smart defaults. Outputs are manually editable without AI cost; section regenerate and video shot regenerate are available when needed. Users export media and copy to post themselves. Billing uses weighted Generation credits by Length Tier. Architecture uses one application seam (`IGenerationService`) with modality providers for text, video, and optional AI images.

## User Stories

1. As a new User, I want to be blocked from Generate until I have a Brand Kit and a Product, so that every Generation has real brand and product context.
2. As a User, I want to create a Brand Kit with name, logo, colors, tone, audience, and things-to-avoid, so that the AI always speaks in my brand voice.
3. As a User, I want optional Brand Kit fields (including AI instructions), so that I can refine voice without a Prompt Studio.
4. As a User, I want Tone limited to Luxury, Professional, Playful, Bold, or Friendly, so that prompting stays consistent.
5. As a User, I want to create a Product with name, description, images, and landing page URL (price optional), so that Generations showcase a real physical product.
6. As a User with exactly one Brand Kit, I want new Products linked to it by default, so that setup stays fast.
7. As a User with multiple Brand Kits, I want to link a Product to one or more Brand Kits, so that agencies can reuse catalog items across brands.
8. As a User, I want Brand Kit creation required before Product creation, so that the domain model stays valid.
9. As a User, I want to start a Generation by picking Product and Goal only, so that I can create in under three clicks.
10. As a User, I want Goals limited to Increase sales, Product launch, and Brand awareness, so that the picker stays minimal and prompts stay sharp.
11. As a User, I want defaults of Teaser Length Tier, Instagram feed, Instagram Reels, and Product photo Post image, so that I rarely open Options.
12. As a User, I want Options for Length Tier, feed platform, reel platform, Post image mode, and Brand Kit when multiple links exist, so that power users keep control.
13. As a User, I want a Generation to produce one Social Post, one Reel Storyboard, and one Video with Reel caption, so that I leave with a full marketing pack.
14. As a User, I want feed Social Posts for Instagram or Facebook, so that my primary ecommerce channels are covered.
15. As a User, I want reel platforms Instagram Reels or TikTok with a Reel caption separate from feed copy, so that each surface gets appropriate copy.
16. As a User, I want Social Post image mode “use Product photo” by default when images exist, so that posts stay trustworthy.
17. As a User, I want optional AI Post image generation conditioned on Product images, so that I can get a designed feed still when needed.
18. As a User, I want Teaser (~8–10s) Video as the default Length Tier, so that fast Generations stay cheap.
19. As a User, I want Promo (~60s) Video as a queued higher-cost Length Tier, so that I can ship longer marketing reels.
20. As a User, I want Promo Video assembled by stitching beat-aligned Shots, so that ~60s works before native long-form providers.
21. As a User, I want every Reel Storyboard to follow hook → attention → product display → viewer connection, so that reels feel like marketing narratives not ads-buy creatives.
22. As a User, I want Creative Brief, Social Post, Reel Storyboard, and Reel caption generated via structured prompt layers, so that Brand Kit always influences outputs.
23. As a User, I want Generation to snapshot Brand Kit and Product fields used, so that past outputs stay honest when I edit brand later.
24. As a User, I want regenerate and section regenerate to use live Brand Kit and Product, so that new AI work matches current brand.
25. As a User, I want to manually edit headlines, body, CTA, hashtags, scene text, and reorder scenes without calling AI, so that small tweaks cost zero tokens.
26. As a User, I want free text section regenerate (fair-use limited), so that I can ask AI to rewrite one part without fear.
27. As a User, I want regenerating a Video Shot to cost credits, so that expensive fal re-renders are metered.
28. As a User, I want weighted Generation credits (Teaser cheaper than Promo), so that billing matches cost.
29. As a User, I want partial success when one arm fails, so that good copy is not thrown away when video fails.
30. As a User, I want free retry on failed arms only, so that I am not charged again for work that already succeeded.
31. As a User, I want to export/download Video and Post image and copy captions, so that I can post manually on social platforms.
32. As a User, I want Prompt Studio removed from the product path, so that I am not managing a second conflicting prompt system.
33. As a User, I want my Brand Kits, Products, and Generations owned by my User account only, so that Phase 1 stays simple without Workspaces.
34. As a User, I want generation progress that feels like a creative partner (not a bare spinner), so that waiting on Teaser or Promo feels intentional.
35. As a User, I want empty/setup states that guide me to create Brand Kit then Product, so that I never hit a dead Generate screen.
36. As a returning User, I want a library of past Generations and Content Outputs, so that I can reopen, edit, export, or retry failed arms.
37. As a User on a paid plan, I want credit checks before Generate and before paid shot regen, so that I understand cost before spending.
38. As a developer agent, I want strong TypeScript with no `any` and types in `types` folders, so that the modular providers stay safe as the system grows.
39. As a User, I want optional AI Post image cost clearly not free like text regen, so that image spend is visible when I opt in.
40. As a User, I want sibling generation of Storyboard and Video from one Creative Brief, so that latency stays acceptable versus sequential storyboard-driven video.

## Implementation Decisions

### Seams and modules

- Primary application seam: `IGenerationService` (evolve current generator service). Controllers and UI call only this for create, status, manual edit, section regenerate, shot regenerate, failed-arm retry, and export metadata.
- Keep `IVideoGenerationProvider` for Teaser renders and Promo Shots (fal).
- Add `ITextGenerationProvider` for Creative Brief, Social Post copy, Reel Storyboard, Reel caption, and text section regenerate (OpenAI).
- Add `IImageGenerationProvider` for optional AI Post image only (concrete vendor chosen by cost/quality; swappable).
- Keep `IStorageService` for Brand Kit/Product Assets and output media.
- Keep subscription/credit checks via existing subscription/billing path; extend for weighted Length Tier credits and shot-regen charges.
- Remove filesystem Product Kit and Prompt Studio from the Phase 1 product path (migrate or delete consumer surfaces).
- Prefer existing ports over new ones except the two modality providers above.

### Domain and schema (logical)

- User-owned: Brand Kit, Product, Brand–Product link, Asset, Generation, Content Outputs (Social Post, Reel Storyboard, Video), Generation snapshot of Brand Kit + Product, credit ledger usage.
- No Workspace/team tables in Phase 1.
- Generation stores status per arm for partial success.
- Video records Length Tier, Reel platform, Reel caption, and Shot list for Promo stitch.
- Social Post stores feed platform, caption fields, Post image mode, and Post image reference.
- Strong TypeScript: no `any`; shared shapes in `types` folders.

### API / product contracts

- Setup gate: cannot create Product without Brand Kit; cannot Generate without Brand Kit + Product.
- Create Generation: Product + Goal required; defaults Teaser / Instagram / Instagram Reels / Product photo; Options override Length Tier, platforms, image mode, Brand Kit if multi-linked.
- Bundle per Generation: 1 Social Post + 1 Reel Storyboard + 1 Video (+ Reel caption).
- Prompt assembly: fixed layers — quality/safety → Brand Kit → Product → Goal/Length Tier/platforms → output schema.
- Parallel arms from Creative Brief; Promo Video = beat-aligned stitch (native long-form later without changing Length Tier UX).
- Manual edit persists without provider calls; text section regen free with fair-use; shot regen costs credits; AI Post image may surcharge (exact number can be config).
- Export only — no Meta/TikTok publish or scheduling.
- Exact numeric credit weights (e.g. Teaser=1, Promo=4) are configuration; behavior is weighted by Length Tier.

### Frontend

- Evolve existing app shell (full studio chrome redesign deferred).
- Screens: Brand Kit CRUD, Product CRUD + links, Generate (Product + Goal + Options), Generation detail with structured editors, library, export actions, setup empty states.
- No Prompt Studio in nav/product path.

### Auth and multi-tenancy

- Existing JWT User model; all new entities scoped by `userId`.

## Testing Decisions

- Good tests assert external behavior through `IGenerationService` (and thin HTTP acceptance only where valuable): setup gates, defaults, bundle shape, snapshot vs live regenerate, credit weighting, partial success + free failed-arm retry, manual edit without provider calls, section regen invoking text provider only, shot regen charging and calling video provider.
- Fake `ITextGenerationProvider`, `IVideoGenerationProvider`, `IImageGenerationProvider`, `IStorageService`, and subscription/credit collaborator — do not hit real OpenAI/fal in unit/integration tests.
- Do not test private prompt-string assembly as brittle snapshots of full prompts; prefer asserting structured inputs passed to the text provider (layers / schema kind) and persisted Content Output fields.
- Prior art: repo has almost no backend tests today (`app.controller.spec.ts` only) — establish Generation service tests as the new pattern; mirror Nest/port fake style consistent with hexagonal layout already in `core/ports`.

## Out of Scope

- Workspace, teams, invites, approval workflows
- Prompt Studio / user prompt template CRUD
- Filesystem Product Kit as the generation source
- Native long-form 60s provider (stitch is Phase 1)
- Social publish APIs, scheduling, analytics
- Shopify/WooCommerce sync
- Full Figma-like canvas, version history, TipTap-everywhere design surface
- Premium studio UI redesign (sidebar/inspector visual overhaul)
- Local self-hosted video models
- Digital products focus
- Extra Goals beyond the three Phase 1 Goals
- Multi-platform feed posts in one Generation (one feed Social Post only)
- Dark-mode / design-system rewrite as a blocker for Phase 1

## Further Notes

- Glossary and decisions: root `CONTEXT.md` and `docs/adr/0001`–`0026`.
- Primary test seam confirmed: `IGenerationService` + modality providers (ADR 0026).
- UI redesign explicitly deferred (ADR 0025); ship flows on existing shell.
- AI Post image vendor (OpenAI vs fal) remains a runtime/config choice behind `IImageGenerationProvider`.
- When implementing, retire Product Kit loader and Prompt Studio consumer paths as part of cutting over to Brand Kit + Product.
