# Phase C — Harden B+A (first slice)

## Problem Statement

Phase 1 shipped Brand Kit–driven Generation (B+A): Social Post, Reel Storyboard, and Video together. Users can still leave with a dishonest Promo experience — Options advertise a ~60s stitch while Export often plays a single beat Shot — and Brand Kit colors/logo never reach the AI, so outputs ignore visual identity. Reel and storyboard copy can also appear in unexpected languages because Generation never locks English. Before Workspace, publish, or Shopify, the shipped loop must be trustworthy.

## Solution

Phase C’s first slice hardens the existing B+A loop only: (1) assemble Promo beat Shots into one playable merged Video via fal merge-videos behind the existing video provider stitch seam, (2) put Brand Kit primary/secondary colors and logo URL into prompt layers and optional AI Post image prompts, (3) lock Generation copy to English in quality/safety and related text paths. Sibling parallel Storyboard/Video arms and creative-partner progress UX stay Phase C backlog. AI Post “looks like Product photo” stays parked unless later proven a product bug.

## User Stories

1. As a User on Promo Length Tier, I want my Generation Video to be one continuous ~60s stitch of beat Shots, so that Export matches what Options promised.
2. As a User, I want Promo beat Shots to remain available after stitch, so that I can retry or regenerate a single Shot without losing the stitch contract.
3. As a User, when Promo stitch fails after Shots succeed, I want clear Video arm failure while keeping finished Shots and other Content Outputs, so that partial success still holds.
4. As a User regenerating a Promo Shot, I want the Video to re-stitch with the new Shot, so that Export stays consistent with the latest beats.
5. As a User, I want Brand Kit primary and secondary colors included in Generation prompt layers, so that copy and storyboard respect brand palette.
6. As a User, I want Brand Kit logo URL included as context in prompt layers, so that the AI can reference brand mark presence without a new asset pipeline.
7. As a User opting into AI Post image, I want colors and logo context in the image prompt, so that the still can align with brand visuals.
8. As a User, I do not want Brand Kit colors injected into fal Video prompts in this slice, so that Product-image conditioning stays the primary video signal.
9. As a User, I want all Generation marketing copy (Social Post, Reel Storyboard, Reel caption, Creative Brief text) written in English by default, so that Reels and posts are usable for my English-first channels.
10. As a User, I want section regenerate to keep the English lock, so that rewriting one field does not switch language.
11. As a User, I want Teaser Generations unchanged except for English lock and richer Brand Kit layers, so that harden work does not break the fast path.
12. As a returning User, I want library reopen to show the merged Promo Video URL when stitch succeeded, so that past Generations stay honest.
13. As a User on a paid plan, I want Promo credit weight unchanged by stitch implementation, so that billing stays Length Tier–weighted as before.
14. As a developer agent, I want stitch behind `IVideoGenerationProvider.stitchClips` with no new application seam, so that tests stay at `IGenerationService`.
15. As a developer agent, I want tests to assert merged Video URL ≠ first Shot alone and that color/logo/English appear in provider inputs, so that regressions cannot silently restore the stub.
16. As a User, I want AI Post image model-quality quirks parked this slice, so that Phase C is not blocked on vendor conditioning fidelity.
17. As a User, I want preferred language on Brand Kit deferred, so that English default ships without new Brand Kit CRUD.
18. As a User, I want sibling parallel Storyboard/Video and creative-partner progress deferred to Phase C backlog, so that honesty ships first.

## Implementation Decisions

- Phase C first slice scope: real Promo stitch, Brand Kit colors + logo in layers and AI Post prompts, English copy lock (ADR 0030).
- Promo stitch: call fal `ffmpeg-api/merge-videos` from `IVideoGenerationProvider.stitchClips` with ordered beat Shot URLs; set Generation Video URL to the merged file; keep Shots for retry/regen (ADR 0027, ADR 0012 intent).
- No new application seam — `IGenerationService` remains primary; modality providers unchanged at the port level except stitch behavior.
- Brand Kit colors (primary/secondary) and logo URL enter the Brand Kit prompt layer and AI Post image prompts; not fal Video prompts (ADR 0028).
- English lock lives in quality/safety (and related text generation paths); Brand Kit preferred-language field deferred (ADR 0029).
- Partial success unchanged: stitch failure fails Video arm; completed Shots and text arms remain.
- Shot regenerate continues to re-stitch when Length Tier is Promo.
- No schema migration required for the first slice if existing Video / Shot fields already store URLs and status.
- Persist merged URL via existing storage later if fal URLs expire — not required to claim stitch honesty in this slice if provider returns a playable merge URL.

## Testing Decisions

- Good tests assert external behavior through `IGenerationService` (and fake `IVideoGenerationProvider` / text / image providers): Promo create yields `video.videoUrl` that is the stitch result (not merely the first Shot URL); Shot regen re-invokes stitch; colors and logo appear in structured Brand Kit layer / image request inputs; English lock appears in quality/safety (or equivalent layer) passed to the text provider.
- Do not snapshot full prompt strings; assert presence of color hexes, logo URL, and English constraint in structured inputs.
- Fake video provider records `stitchClips` calls and returns a distinct merged URL for assertions.
- Prior art: `generation.service.spec.ts` Promo Length Tier, Shot regenerate, and AI Post image describes.

## Out of Scope

- Sibling parallel Storyboard/Video arms after Creative Brief
- Creative-partner Generation progress UX
- Workspace, teams, publish/schedule, Shopify/WooCommerce sync
- Studio chrome redesign (sidebar/canvas/inspector)
- Brand Kit preferred-language field and multi-language UX
- Fixing AI Post image model/conditioning quality (unless proven product bug)
- Injecting colors into fal Video prompts
- Logo as pixel image-input conditioning for AI Post or Video
- Native long-form ~60s provider replacing stitch
- Changing Length Tier credit weights
- Server-side ffmpeg or playlist-only Promo Export

## Further Notes

- Glossary and decisions: root `CONTEXT.md` and `docs/adr/0027`–`0030` (plus Phase 1 ADRs `0001`–`0026`).
- Primary test seam: `IGenerationService` + `IVideoGenerationProvider.stitchClips`.
- Tickets for this slice live under `.scratch/phase-c-harden-ba/issues/`.
- Work the frontier with `/implement`; clear context between tickets.
