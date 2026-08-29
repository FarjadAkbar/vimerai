# Vimerai

Ecommerce-focused AI creative studio (Fetra-style): paste a business URL to generate Business DNA, then create Posts and Videos separately in Brand Studio and Export the results.

## Language

### Product roadmap (locked)

**Fetra-clone create studio (current scope)**:
Happy path: business/homepage URL → Business DNA on a Brand → Brand Studio surfaces: Blitz (Make a Post–style), Viral Remix (Make a Video–style), AI Influencers, AI Image Generator, Library (My Content + My Media Store), and Media Store pickers. Shared platform Templates (Blitz vs Viral Remix types) feed those flows; users Edit Blitz outputs and Export. Reference images for Jobs come from Media Store uploads; Brand Confirm stays the manual Brand fallback.
_Avoid_: Treating the older “MVP-only Posts+Videos, Influencers parked” cut as current scope; cloning Fetra’s marketing site, publish, trend scrape, warmed accounts, or Calendar before the create/edit/library loop is solid

**Parked (not current scope)**:
Platform API publish, Workspace/team, Video Director chat agent, Growth Team, Calendar, Warmed accounts, multi-arm Generation as one run, Reel Storyboard as a first-class sibling.
_Avoid_: Shipping publish or Video Director as the primary create path; calling this “Phase C”
### Ownership

**User**:
The authenticated account that owns Brands, Jobs, Content Items, Media Assets, AI Influencers, Blitz Configuration, and billing. No Workspace, team, or org layer in current scope.
_Avoid_: Account (prefer User), tenant, workspace

### Brand & product

**Brand**:
The reusable identity used as context for Jobs. Core comes from Business DNA (name, logo, colors, tone/styles, and related DNA fields). Created via Business DNA from a homepage URL or via Brand Confirm. No separate Product entity in current scope.
_Avoid_: Brand Kit (deprecated), brand profile, brand settings, style guide

**Business DNA**:
The structured brand package generated from a business/homepage URL (scrape + LLM structuring) and persisted on a Brand. Presented as Brand Overview and Business Details before the user enters Brand Studio.
_Avoid_: Brand Kit, brand profile, onboarding wizard (as the product name)

**Brand Overview**:
The Business DNA view of identity signals: name, website URL, logo, typography, brand colors, tagline, values, aesthetic, tone (and tone of voice), image style, writing style.
_Avoid_: Brand Kit summary

**Business Details**:
The Business DNA view of commercial context: industry, primary language, elevator pitch, audience and core selling points. Product/person photos for a Job are Media Assets or one-off reference uploads — not a Product record.
_Avoid_: Company profile, about page

**Brand Confirm**:
The short manual path to create or edit the Brand core (name, logo, primary color, tone) when the user skips or overrides URL Business DNA — offered inline on Business DNA, not as a Brand Kit page. Saving creates or updates a reusable Brand.
_Avoid_: Full Brand Kit form; treating Brand Confirm as the only MVP entry after Business DNA is expected

**Brand Studio**:
The primary authenticated app shell after Business DNA (or Brand Confirm). Houses Blitz, Viral Remix, AI Influencers, AI Image Generator, Library, and Business DNA — not a demoted Brands/Products library as primary nav.
_Avoid_: Generator home, dashboard (ambiguous); sending users to Brand Kit / Products library pages for setup

**AI Influencer**:
A User-owned synthetic persona (portrait, name, gender, age, ethnicity, appearance prompt) used to generate Influencer Images and Influencer Videos.
_Avoid_: Avatar (ambiguous), model (fashion sense), character (games)

**Media Asset**:
A User-owned file (image, video, or audio). Any upload from pickers or Library creates a Media Asset immediately and can be reused across Blitz edit, Viral Remix inputs, Influencer flows, and AI Image Generator. Distinct from Content Item (composed job output) and Template (platform catalog).
_Avoid_: File, upload (as the entity name), Product image (as a separate entity), Asset when meaning job output; ephemeral-only uploads as the default

**Media Store**:
The Library “My Media Store” tab and in-flow pickers for browsing Media Assets (all / images / videos / audios). Not where Templates or My Content live.
_Avoid_: Mixing Templates into Media Store; calling job outputs “media” in the Store sense

**Library**:
Brand Studio page with two tabs — **My Content** (Content Items: all / building / created / failed) and **My Media Store** (Media Assets: all / images / videos / audios).
_Avoid_: Generations library; stuffing Templates into Library tabs

**Template**:
A platform-owned reusable creative reference stored in its own templates catalog (not User Content, not Media Store). Typed as Blitz or Viral Remix; Blitz Templates carry a content type used with Blitz Configuration filtering.
_Avoid_: Format (Formats are prompt patterns; Templates are media references), sample video, storing Templates in the videos/User output table

**Blitz Configuration**:
Per-Brand settings for Blitz: mention-business frequency, show-influencer toggle, and which content types are enabled (slideshow, wall of text, green screen, hook+demo). Switching Brand switches config.
_Avoid_: Account-global-only Blitz settings; Settings dump

**Brand Kit** _(deprecated)_:
Former richer brand entity required before Product/Generation. Replaced by Brand + Business DNA / Brand Confirm. Do not use in new UI copy.
_Avoid_: Using this term for new work

**Tone**:
A Brand voice preset used for job prompting. Closed set: Luxury, Professional, Playful, Bold, Friendly. Distinct from free-text tone of voice on Business DNA.
_Avoid_: Style, voice (as a separate enum), mood

**Product** _(deprecated)_:
Former User-owned sellable item and Product scrape path. Replaced by Brand DNA plus Media Asset / one-off reference uploads on Viral Remix and other Jobs. Drop `brand_kit_products`.
_Avoid_: Reviving Product Kit; requiring a Product record before create flows

**Product scrape** _(deprecated)_:
Former PDP URL import into a Product entity. Not part of the current Brand-DNA-first model.
_Avoid_: Treating a PDP URL as Business DNA input; requiring scrape before Viral Remix

**Brand–Product link** _(deprecated)_:
Former Brand Kit ↔ Product join. Not part of the current model.
_Avoid_: Requiring a join table before create flows

**Product Kit** _(deprecated)_:
Former filesystem package that mixed brand, product, shot templates, and model config.
_Avoid_: Using this term for new work

**Prompt Studio** _(deprecated)_:
Former user-facing prompt template editor. Jobs are driven by Brand + Template/Format + Media Assets.
_Avoid_: Prompt template (as a consumer feature), custom prompt library

### Formats & jobs

**Job**:
One user-initiated async run (generate, regenerate, animate, talking-head, Blitz Done Editing compose, etc.). Stored in a single jobs table with a type, status, input payload, and links to outputs. Credits are charged per Job.
_Avoid_: Generation (deprecated umbrella), separate modality job tables as the long-term model (`image_jobs` / `post_jobs` / `video_jobs` as permanent peers)

**Content Item**:
A User-owned Library **My Content** artifact — the composed final media file from a Job (not structured Blitz edit chrome). Lives in My Content only by default (not auto-copied into Media Store). Distinct from Media Asset and Template.
_Avoid_: Dual-writing every output into Media Store; storing fonts/overlays as the durable Library record; packing Templates into User outputs

**Blitz Edit**:
Client-side remix of a Blitz Template (text, style, audio, video, overlays). Done Editing runs a compose step, then a Job persists the composed file as a Content Item — never as a Template.
_Avoid_: Saving edits as Templates; treating edit JSON as Library content

**Format** _(deprecated)_:
Former curated pattern catalog (meme CTA, problem-solution, …). Replaced by Template type/content type plus Job inputs (instructions, ratio, duration, quality). Do not revive Format as a peer catalog beside Template.
_Avoid_: Using Format for Blitz/Viral Remix; dual-naming content types as Formats

**Make a Post** / **Blitz**:
Brand Studio surface for template-led short creatives: Templates filtered by Blitz Configuration content types, swipe/edit, Export. Brand DNA supplies identity; no Product or Format entity required.
_Avoid_: Generation; Format catalog for Blitz

**Make a Video** / **Viral Remix**:
Brand Studio surface where the User supplies ref video, optional product image, optional person image, instructions, ratio, duration, and quality; platform Viral Remix Templates can fill ref video. Produces a Job → Content Item.
_Avoid_: Requiring a Product record; Video Director as the primary path

**Post Job** / **Video Job** _(deprecated names)_:
Former modality-specific job tables/terms. Prefer **Job** with a type, plus **Content Item** outputs.
_Avoid_: Keeping post_jobs / video_jobs / image_jobs / generations as the long-term model

**Video Director** _(parked)_:
Competitor-style chat agent that plans storyboards and videos conversationally. Not part of MVP; fallback Video entry is Make a Video / Video Job in Brand Studio.
_Avoid_: Shipping Vivi-like chat as the only Video path in MVP

**Generation** _(deprecated)_:
Former umbrella for multi-arm or Posts-only create runs. Replaced by Job + Content Item.
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
An input media file (image, video, logo) stored as a Media Asset — not a job output. Reference images condition Viral Remix, AI Image Generator, and related Jobs.
_Avoid_: File, media, creative (for inputs)

**Credit**:
The usage unit deducted per Post Job or Video Job (including regenerate as a new job). Exact weights TBD in implementation/billing design.
_Avoid_: Token (LLM billing), Generation credit (deprecated name)
