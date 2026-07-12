# Promo stitch uses fal merge-videos behind IVideoGenerationProvider

Phase C (and the Phase 1 Promo contract) assembles beat Shots into one playable Promo Video by calling fal `ffmpeg-api/merge-videos` from `IVideoGenerationProvider.stitchClips`. Server-side ffmpeg and playlist-only UX were rejected: playlist fails Export honesty; self-hosted ffmpeg adds deploy ops without changing the product seam. Native long-form providers can still replace the whole Promo pipeline later without changing Length Tier UX (ADR 0012 intent).
