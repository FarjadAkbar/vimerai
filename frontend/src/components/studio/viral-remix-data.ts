/** Curated Viral Remix template cards (format-backed). */
export const VIRAL_REMIX_TEMPLATES = [
  {
    id: "hook-reveal",
    label: "Hook reveal",
    gradient: "from-violet-600 via-fuchsia-500 to-orange-400",
  },
  {
    id: "demo-in-use",
    label: "Demo in use",
    gradient: "from-sky-600 via-cyan-500 to-emerald-400",
  },
  {
    id: "problem-solution",
    label: "Problem → solution",
    gradient: "from-rose-600 via-red-500 to-amber-400",
  },
  {
    id: "before-after",
    label: "Before & after",
    gradient: "from-indigo-700 via-blue-600 to-teal-400",
  },
] as const;

export const REMIX_STEPS = [
  {
    title: "Upload reference assets",
    body: "Choose a reference video and optional Product or Person images.",
  },
  {
    title: "Click Generate",
    body: "AI will handle the transformation and remix pacing.",
  },
  {
    title: "View the remix video",
    body: "Your vertical remix video will be ready in a few minutes.",
  },
] as const;
