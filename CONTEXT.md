# Vimerai

AI creative studio that turns ecommerce brand and product context into marketing content (social posts, reel storyboards, and short-form video).

## Language

### Product roadmap (locked)

**Phase 1 (B+A)**:
A single generation flow that produces real short-form video and social post / storyboard content together — not video-only, not copy-only.
_Avoid_: Shipping posts without video first; shipping video without companion copy first

**Phase C (harden B+A)**:
Make the shipped B+A loop honest and trustworthy before new domains (publish, Shopify, Workspace, studio chrome redesign). **First implementable slice:** (1) real Promo stitch via fal merge-videos into one playable ~60s Video, (2) Brand Kit colors and logo URL in prompt layers and AI Post image prompts, (3) English language lock on Generation copy. Sibling parallel Storyboard/Video arms and creative-partner progress UX remain Phase C backlog, not in the first slice. AI Post image “looks like Product photo” stays parked (model/conditioning) unless later proven to be a product bug (e.g. silent Product-photo fallback). Brand Kit preferred-language field is deferred.
_Avoid_: Treating Phase C as Workspace/publish/Shopify; calling this “Phase 2” until a separate Phase 2 is locked; shipping colors-in-layers before honest Promo stitch; expanding the first slice to include parallel arms or progress UX

### Ownership

**User**:
The authenticated account that owns Brand Kits, Products, Generations, and billing. Phase 1 has no Workspace, team, or org layer.
_Avoid_: Account (prefer User), tenant, workspace

### Brand & product

**Brand Kit**:
The reusable identity and voice of a brand used as context for every Generation. Phase 1 required fields: name, logo, colors, tone, audience, things-to-avoid. All other brand fields are optional. Creating a Brand Kit is required before creating a Product.
_Avoid_: Product Kit, brand profile, brand settings, style guide

**Tone**:
A Brand Kit voice preset. Phase 1 closed set: Luxury, Professional, Playful, Bold, Friendly. Finer voice control uses optional AI instructions, not more tone labels.
_Avoid_: Style, voice (as a separate enum), mood

**Product**:
A physical sellable item that can be linked to one or more Brand Kits. Phase 1 required fields: name, description, images, landing page URL. Price is optional. All other product fields are optional. Phase 1 does not focus on digital products.
_Avoid_: Product Kit, SKU-as-entity, listing, item, digital download

**Brand–Product link**:
The association between a Product and a Brand Kit. A Product must have at least one link. If the user has exactly one Brand Kit, new Products are linked to it by default.
_Avoid_: Ownership (prefer “link”), membership

**Product Kit** _(deprecated)_:
Former filesystem package that mixed brand, product, shot templates, and model config. Replaced by Brand Kit + Product.
_Avoid_: Using this term for new work

**Prompt Studio** _(deprecated for Phase 1)_:
Former user-facing prompt template editor. Phase 1 Generations are driven by Brand Kit + Product + Goal + system templates; optional Brand Kit AI instructions are the only user prompt escape hatch.
_Avoid_: Prompt template (as a consumer feature), custom prompt library

### Generation

**Generation**:
One user-initiated create action that yields one or more Content Outputs (and, in Posts-only, Post Concepts) for a Product under a Brand Kit and Goal. Requires an existing Brand Kit and Product — Generation is blocked until both exist. Two paths: **multi-arm** (Social Post + Reel Storyboard + Video; Phase 1 defaults Length Tier Teaser, feed Instagram, reel Instagram Reels, Post image Product photo) and **Posts-only** (see Posts-only Generation). Brand Kit auto-selected when the Product has one link (must choose when multiple). Stores a snapshot of the Brand Kit and Product fields used; reopen shows that snapshot. Regenerate and section-regenerate use the live Brand Kit and Product. Multi-arm arms may complete independently: partial success keeps finished Content Outputs; failed arms are retryable without recharging for work that already succeeded.
_Avoid_: Job (prefer in implementation only), render, run

**Posts-only Generation**:
A Generation path that skips Video and Reel Storyboard. Happy path: Product + Goal → exactly ten Instagram Post Concepts → user selects up to three → each selected Post Concept renders as a Social Post with an AI-generated Post image (Product photo is not offered in this path). Credits: charge for the Post Concept set; charge again per rendered Social Post. Competitor Task brief and soft memory are deferred.
_Avoid_: Multi-arm Generation, posts mode (prefer Posts-only Generation), video-off checkbox as the name of the path

**Content Output**:
A concrete generated artifact the user can view, edit, and export. Phase 1 types: Social Post, Reel Storyboard, Video. Post Concepts are not Content Outputs. Phase 1 editing is structured fields and scene lists (including reorder): the user can change text and simple fields directly and save with no AI call. Section regenerate is optional when they want the AI to rewrite a part. Freeform design canvas and version history are deferred.
_Avoid_: Result, asset (assets are inputs), creative, Post Concept

**Manual edit**:
A user change to a Content Output field (headline, body, CTA, hashtags, scene text, etc.) saved without calling the AI. Preferred for small tweaks to avoid token cost.
_Avoid_: Regenerate, section regenerate

**Section regenerate**:
An AI request that rewrites only a chosen part of a Content Output (e.g. hashtags, one storyboard scene, CTA) using the live Brand Kit and Product. Used when the user wants a new AI suggestion, not for typos or light wording tweaks.
_Avoid_: Full regenerate (that regenerates the whole Generation or whole Content Output), manual edit

**Social Post**:
A platform-specific **feed** post for Instagram or Facebook: caption package (headline, body, CTA, caption, hashtags) plus a post image. Phase 1 multi-arm Generation: one Social Post per Generation; feed platform is Instagram or Facebook (user picks; default Instagram). Image mode is either **use Product photo** (default when Product images exist) or **AI-generated image** (optional), with Product images used as conditioning when generating. Delivered via Export, not API publish. Posts-only Generation may yield multiple Social Posts from selected Post Concepts (see Post Concept).
_Avoid_: Caption-only, tweet, listing, reel caption (that belongs on Video), Post Concept (directions before a Social Post exists)

**Post Concept**:
One alternate Instagram feed direction shown before the user commits to a Social Post. Fields: hook, visual idea, and angle (why it fits the Goal). Not a Content Output and not a Social Post until the user selects it and it is rendered. Posts-only Generation produces exactly ten Post Concepts; the user may select up to three to render as Social Posts.
_Avoid_: Creative Brief, concept card, post direction, Social Post, outline

**Post image**:
The visual attached to a Social Post — either a selected Product Asset or an AI-generated still.
_Avoid_: Thumbnail, creative, asset (assets are inputs; a Post image is part of a Content Output)

**Reel platform**:
Where the Video is intended to be published. Phase 1: Instagram Reels or TikTok (user picks).
_Avoid_: Feed platform, Social Post platform

**Reel caption**:
Copy that accompanies the Video for the chosen Reel platform (distinct from the feed Social Post caption package).
_Avoid_: Social Post, feed caption

**Reel Storyboard**:
A scene-by-scene plan for a marketing reel — not the rendered Video. Every reel plan follows four beats: hook, attention, product display, and connection with the viewer (plus overlays, voice-over, music/transitions, ending CTA as needed). In Phase 1 it is generated as a sibling of the Video from a shared creative brief, not as the driver of the video render.
_Avoid_: Storyboard-as-video, script-only, ad storyboard (we make marketing reels, not ad-buy creatives)

**Creative Brief**:
The shared structured intent (hook, attention, product display, viewer connection, tone, CTA, goal, length tier) produced once per Generation and fed in parallel to Social Post, Reel Storyboard, and Video arms. Text arms (brief, Social Post, Reel Storyboard, Reel caption) use an LLM text provider; Video uses the video provider. Distinct from Post Concept (many alternate Instagram directions in Posts-only).
_Avoid_: Prompt (implementation), master prompt, outline, Post Concept

**Prompt layers**:
The fixed order of context sent into text generation: (1) quality and safety rules — including Phase C default **write all copy in English** (2) Brand Kit — including name, tone, audience, things-to-avoid, primary/secondary colors, logo URL as context, and optional AI instructions (3) Product (4) Goal, Length Tier, and platforms (5) output schema for the requested artifact. Section regenerate reuses layers and swaps only the output schema / target section. Optional AI Post image prompts also receive Brand Kit colors and logo context; Phase C does not inject colors into fal Video prompts. Brand Kit preferred-language as a user field is deferred.
_Avoid_: Ad hoc prompt string, Prompt Studio template

**Length Tier**:
The user-selected target duration for a Generation’s Video (and matching Reel Storyboard scope). Phase 1 tiers: **Teaser** (~8–10s, default, fast) and **Promo** (~60s, queued, higher cost). Promo Video is produced by stitching short clips aligned to reel beats; a native long-form provider can replace that later without changing the Length Tier UX. Billing uses weighted credits (Teaser costs less than Promo).
_Avoid_: Mode (conflicts with existing fal fast/cinematic/avatar), quality preset

**Generation credit**:
The usage unit deducted for a Generation. Multi-arm cost is weighted by Length Tier (e.g. Teaser = 1, Promo = 4). Posts-only charges 1 credit for the ten-Post-Concept set, then 1 credit per rendered Social Post (AI Post image included in that render charge). Manual edits cost zero. Text section regenerate is free (fair-use limited). Regenerating a Video shot costs credits (e.g. 1 per shot).
_Avoid_: Token (LLM billing), video credit (as a separate meter in Phase 1)

**Shot**:
One short rendered clip that is part of a Promo Video stitch (typically one reel beat). Teaser Video is a single shot. Promo stitches beat Shots into one Video via the video provider’s merge/stitch capability (fal merge-videos in Phase C).
_Avoid_: Scene (prefer for storyboard narrative units), segment

**Video**:
The rendered marketing-reel Video Content Output from a Generation, plus its Reel caption for the chosen Reel platform (Instagram Reels or TikTok). Length follows the chosen Length Tier. Phase 1 delivery is export/download — not platform API publishing.
_Avoid_: Reel (prefer Reel Storyboard for the plan; Video for the file), ad, clip, render

**Export**:
Downloading or copying Content Output media and text for the user to post manually on social platforms. Phase 1 has no in-app publish or schedule.
_Avoid_: Publish, schedule, post (as a platform API action)

**Goal**:
The marketing objective that steers a Generation. Phase 1 Goals: Increase sales, Product launch, Brand awareness. Other goals (seasonal, flash sale, retargeting, lead gen) are deferred.
_Avoid_: Campaign objective (until Campaign exists as an entity), intent

**Asset**:
An input media file (image, video, logo) attached to a Brand Kit or Product — not a generated Content Output. Product images condition Video and optional AI Post images.
_Avoid_: File, media, creative
