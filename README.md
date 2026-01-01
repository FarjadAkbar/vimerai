# vimerai
vimerai

## FRONTEND

app/
├── (auth)/
│   ├── login/
│   ├── register/
│   └── reset-password/
├── (app)/
│   ├── generator/
│   ├── prompt-studio/
│   ├── my-videos/
│   └── pricing/
├── layout.tsx
├── page.tsx
├── components/
├── lib/
│   ├── api/
│   ├── auth/
│   └── utils/


## By end of Month 1:
-Auth pages working
-Generator page functional (mock)
-Prompt Studio v1 live
-API calls wired to backend
-Loading + error states
-Fast page load (Lighthouse > 80)


### 1️⃣ UI SKETCHES (PHASE-1, MONTH-1)
These are intentionally minimal. This is what successful early SaaS products look like before polish.

### Generator Page (Core Experience)
This is your money page.

----------------------------------------------------
| Logo                                  My Account |
----------------------------------------------------

Create a video from a prompt

[ Prompt Input - multiline textarea               ]
[ "Describe the video you want to generate..."    ]

[ Generate Video ]   (primary button)

----------------------------------------------------
| Status Area                                     |
|                                                |
| ⏳ Generating...                                |
| (or)                                           |
| ✅ Video generated successfully                 |
|                                                |
----------------------------------------------------

[ Video Preview Placeholder / Mock Result ]
(Thumbnail + play icon OR simple placeholder)

----------------------------------------------------
**UX Notes**
One clear action
No distractions
User always knows what’s happening
This converts better than fancy dashboards


### Prompt Studio v1 (Templates)
----------------------------------------------------
| Prompt Studio                                   |
----------------------------------------------------

Choose a prompt template

[ Card ] Product Promo
[ Card ] Explainer Video
[ Card ] Social Media Clip
[ Card ] Custom Prompt

----------------------------------------------------

Selected Template: Product Promo

[ Prompt Textarea (pre-filled template) ]

[ Use in Generator → ]

----------------------------------------------------
**Why this works**
Templates reduce friction
Easy to expand later
No complex editor yet


### My Videos (Basic)
----------------------------------------------------
| My Videos                                       |
----------------------------------------------------

[ Video Card ]   Title
Generated: 2 mins ago
Status: Completed

[ Video Card ]   Title
Generated: Processing...

----------------------------------------------------
**Keep it** :
Read-only
Simple
No filters yet

### Auth Pages (Signup / Login)
----------------------------------------------------
| Create Account                                  |
----------------------------------------------------

Email
Password
Confirm Password

[ Sign Up ]

Already have an account? Login
----------------------------------------------------
No social login in Phase 1.

### Pricing Page (Month 2)
----------------------------------------------------
| Pricing                                         |
----------------------------------------------------

Starter Plan
- 10 videos / month
- Fast model
- Email support

[ Get Started ]

----------------------------------------------------
One plan. Period.
