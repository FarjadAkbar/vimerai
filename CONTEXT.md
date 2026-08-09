# Vimerai

Ecommerce-focused AI creative studio (Fetra-style): paste a business URL to generate Business DNA, then create Posts and Videos separately in Brand Studio and Export the results.

## Language

### Product roadmap (locked)

**MVP (Fetra-style create loop)**:
Happy path: business/homepage URL → generate Business DNA (Brand Overview + Business Details) → Brand Studio with two separate modes — Make a Post (Blitz-like phone cards / Formats) and Make a Video (Viral Remix–like asset+generate, or simpler Video Job) → Export. Product page scrape (or manual Product) remains available to seed Product images for jobs. Thin Brand Confirm is the manual fallback when URL DNA is skipped. Marketing-site clone, publish, trend scrape, warmed accounts, AI Influencers, Calendar, and Video Director chat are out of MVP.
_Avoid_: Multi-arm Generation (post+storyboard+video together); Posts-only concept sets; shipping publish in MVP; cloning Fetra’s marketing site before the create app UX; forcing thin-Brand-only when Business DNA from URL is the expected entry

**Parked (former Phase 1 / Phase C / later Fetra surfaces)**:
Multi-arm Generation, Reel Storyboard, Posts-only / Post Concepts, Length Tiers (Teaser/Promo), Goals, Creative Brief as a shared multi-arm artifact, section regenerate, caption packages, platform API publish, Workspace/team, Video Director chat agent, AI Influencers, Growth Team, Calendar, Warmed accounts.
_Avoid_: Treating parked Phase 1/C items as current MVP scope; calling this “Phase C”; shipping Video Director as MVP Video entry

### Ownership

**User**:
The authenticated account that owns Brands, Products, Post Jobs, Video Jobs, and billing. MVP has no Workspace, team, or org layer.
_Avoid_: Account (prefer User), tenant, workspace

### Brand & product

**Brand**:
The reusable identity used as context for Post Jobs and Video Jobs. Required core: name, logo, primary color, tone. May also hold Business DNA fields (website URL, color palette, typography, tagline, values, aesthetic, tone of voice, image style, writing style, industry, primary language, elevator pitch, audience/selling points). Created via Business DNA from a homepage URL, or via Brand Confirm as the manual fallback.
_Avoid_: Brand Kit (deprecated), brand profile, brand settings, style guide

**Business DNA**:
The structured brand package generated from a business/homepage URL (scrape + LLM structuring) and persisted on a Brand. Presented as Brand Overview and Business Details before the user enters Brand Studio.
_Avoid_: Brand Kit, brand profile, onboarding wizard (as the product name)

**Brand Overview**:
The Business DNA view of identity signals: name, website URL, logo, typography, brand colors, tagline, values, aesthetic, tone (and tone of voice), image style, writing style.
_Avoid_: Brand Kit summary

**Business Details**:
The Business DNA view of commercial context: industry, primary language, elevator pitch, audience and core selling points. Product images for jobs stay on Product (PDP scrape or manual), not as a required Brand field.
_Avoid_: Company profile, about page

**Brand Confirm**:
The short manual path to create or edit the Brand core (name, logo, primary color, tone) when the user skips or overrides URL Business DNA. Saving creates or updates a reusable Brand.
_Avoid_: Full Brand Kit form; treating Brand Confirm as the only MVP entry after Business DNA is expected

**Brand Studio**:
The primary authenticated app shell after Business DNA (or Brand Confirm). Houses separate Posts and Videos create modes plus access to Brands/Products — not the legacy multi-arm Generation home.
_Avoid_: Generator home, dashboard (ambiguous), Fetra clone of warmed accounts / growth team

**Brand Kit** _(deprecated)_:
Former richer brand entity (name, logo, colors, tone, audience, things-to-avoid, optional AI instructions) required before Product/Generation. Replaced by Brand + Business DNA / Brand Confirm. Do not use this term in new UI copy.
_Avoid_: Using this term for new work

**Tone**:
A Brand voice preset used for job prompting. Closed set: Luxury, Professional, Playful, Bold, Friendly. Distinct from free-text tone of voice on Business DNA.
_Avoid_: Style, voice (as a separate enum), mood

**Product**:
A physical sellable item owned by the User. Required fields: name, description, images, source URL when scraped. Price is optional. Happy path: scrape a product page URL (Shopify and similar storefronts first) to fetch images and details; manual entry is the fallback. The saved Product record is the generation context for later jobs (no separate Memory entity).
_Avoid_: Product Kit, SKU-as-entity, listing, item, digital download, Memory (as an entity)

**Product scrape**:
Fetching Product name, description, and images from a product page URL to seed or update a Product. Distinct from Business DNA homepage analysis.
_Avoid_: Import, sync, crawl (prefer scrape for this MVP action); treating a PDP URL as Business DNA input

**Brand–Product link** _(deprecated for MVP)_:
Former required association between Product and Brand Kit. MVP jobs take an explicit Brand and Product; a hard many-to-many link entity is not required for the create loop.
_Avoid_: Requiring Brand Kit links before Product exists

**Product Kit** _(deprecated)_:
Former filesystem package that mixed brand, product, shot templates, and model config.
_Avoid_: Using this term for new work

**Prompt Studio** _(deprecated)_:
Former user-facing prompt template editor. Jobs are driven by Brand + Product + Format.
_Avoid_: Prompt template (as a consumer feature), custom prompt library

### Formats & jobs

**Format**:
A curated viral creative pattern the user picks before a job (e.g. meme CTA, problem-solution, listicle hook). Each Format is tagged `post`, `video`, or `both`. The create mode filters which Format cards appear. MVP Formats are a fixed owned library — not live trend scrape or “recreate this URL.”
_Avoid_: Template (ambiguous), trend, Post Concept, Creative Brief

**Make a Post**:
The Brand Studio Posts mode (Blitz-like): browse Formats/templates, run a Post Job, review phone-framed cards, accept/edit/export. Separate from Make a Video.
_Avoid_: Blitz (competitor product name in our glossary), Generation, bundling with Video

**Make a Video**:
The Brand Studio Videos mode (Viral Remix–like or simpler): choose Brand + Product (+ Format / reel platform), generate a Video Job, preview, Export. Separate from Make a Post. Video Director chat is parked.
_Avoid_: Viral Remix (competitor product name in our glossary), Video Director, bundling with Post

**Post Job**:
One user-initiated Make a Post run for a Brand + Product + Format. Yields one Instagram feed Post image (AI-generated; Product images condition the model). No AI caption package. Regenerate starts a new Post Job with the same Brand + Product + Format and charges again.
_Avoid_: Generation, multi-arm, Posts-only, Social Post with caption

**Video Job**:
One user-initiated Make a Video run for a Brand + Product + Format + reel platform (Instagram Reels or TikTok). Yields one ~15–30s 9:16 Video file. No AI caption package. Regenerate starts a new Video Job with the same inputs and charges again.
_Avoid_: Generation, Length Tier, Promo stitch as MVP requirement, Reel caption, Video Director

**Video Director** _(parked)_:
Competitor-style chat agent that plans storyboards and videos conversationally. Not part of MVP; fallback Video entry is Make a Video / Video Job in Brand Studio.
_Avoid_: Shipping Vivi-like chat as the only Video path in MVP

**Generation** _(deprecated)_:
Former umbrella for multi-arm or Posts-only create runs. Replaced by Post Job and Video Job as separate terms.
_Avoid_: Using Generation as the user-facing or domain umbrella for new work

**Posts-only Generation** _(deprecated)_:
Former path that produced Post Concepts then rendered Social Posts.
_Avoid_: Using this path in MVP

**Post Concept** _(deprecated)_:
Former alternate Instagram direction card before committing to a Social Post.
_Avoid_: Format (Formats are curated patterns, not concept brainstorm sets)

**Content Output** _(deprecated as umbrella)_:
Former shared term for Social Post, Reel Storyboard, and Video from one Generation. MVP artifacts are the Post image from a Post Job and the Video from a Video Job.
_Avoid_: Forcing a shared Content Output type in the glossary

**Social Post** _(deprecated name for MVP artifact)_:
Prefer **Post image** for the Instagram-ready still from a Post Job. Former Social Post included a caption package and optional Facebook feed.
_Avoid_: Caption package, Facebook feed in MVP

**Post image**:
The AI-generated Instagram feed still produced by a Post Job. Always AI-generated in MVP (not “use Product photo” as a mode). Delivered via Export.
_Avoid_: Thumbnail, captioned Social Post, Product photo mode

**Reel platform**:
Where the Video is intended to be published manually. MVP: Instagram Reels or TikTok (user picks on Video Job).
_Avoid_: Feed platform

**Reel caption** _(deprecated for MVP)_:
Former AI copy accompanying a Video. MVP exports the Video file only; users write platform captions outside the app.
_Avoid_: Generating captions for Video Jobs in MVP

**Reel Storyboard** _(parked)_:
Former scene-by-scene reel plan. Not part of MVP.
_Avoid_: Shipping storyboard as a sibling of Video Job

**Creative Brief** _(parked)_:
Former shared multi-arm intent object. Format + Brand + Product replace it for MVP jobs.
_Avoid_: Using Creative Brief as a required MVP entity

**Length Tier** _(parked)_:
Former Teaser (~8–10s) vs Promo (~60s) choice. MVP Video Jobs target ~15–30s without a user-facing Length Tier control.
_Avoid_: Teaser/Promo as MVP UX

**Goal** _(parked)_:
Former marketing objective enum on Generation. Format selection steers creative angle in MVP.
_Avoid_: Requiring Goal before Post Job or Video Job

**Export**:
Downloading the Post image or Video file for the user to post manually on social platforms. MVP has no in-app publish or schedule.
_Avoid_: Publish, schedule, post (as a platform API action)

**Asset**:
An input media file (image, video, logo) attached to a Brand or Product — not a job output. Product images condition Post image and Video generation.
_Avoid_: File, media, creative (for inputs)

**Credit**:
The usage unit deducted per Post Job or Video Job (including regenerate as a new job). Exact weights TBD in implementation/billing design.
_Avoid_: Token (LLM billing), Generation credit (deprecated name)
