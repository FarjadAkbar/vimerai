"use client";

import { cn } from "@/lib/utils";

const CARDS = [
  {
    platform: "instagram" as const,
    handle: "vimerai.growth",
    caption: "Visual proof + soft CTA",
    likes: "24.8K",
    comments: 512,
    gradient: "from-rose-400 via-orange-300 to-amber-200",
  },
  {
    platform: "tiktok" as const,
    handle: "vimerai.growth",
    caption: "Short-form product story #growth #viralcontent",
    likes: "186K",
    comments: 2941,
    gradient: "from-violet-500 via-fuchsia-400 to-pink-300",
  },
  {
    platform: "instagram" as const,
    handle: "vimerai.growth",
    caption: "Founder angle + proof",
    likes: "18.3K",
    comments: 406,
    gradient: "from-sky-400 via-blue-300 to-indigo-200",
  },
  {
    platform: "tiktok" as const,
    handle: "vimerai.growth",
    caption: "Meme format + product CTA",
    likes: "92.4K",
    comments: 1108,
    gradient: "from-emerald-400 via-teal-300 to-cyan-200",
  },
  {
    platform: "instagram" as const,
    handle: "vimerai.growth",
    caption: "Audience pain point + CTA",
    likes: "31.6K",
    comments: 694,
    gradient: "from-amber-400 via-yellow-300 to-lime-200",
  },
  {
    platform: "tiktok" as const,
    handle: "vimerai.growth",
    caption: "Creator-style product proof",
    likes: "74.9K",
    comments: 932,
    gradient: "from-orange-400 via-red-300 to-rose-200",
  },
];

function PhoneCard({
  card,
  className,
}: {
  card: (typeof CARDS)[number];
  className?: string;
}) {
  const isTikTok = card.platform === "tiktok";

  return (
    <div
      className={cn(
        "relative shrink-0 w-[168px] sm:w-[188px] rounded-[1.75rem] border border-neutral-200/80 bg-white shadow-xl overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "relative aspect-[9/16] bg-gradient-to-br flex flex-col",
          card.gradient,
        )}
      >
        {isTikTok ? (
          <>
            <div className="flex items-center justify-between px-3 pt-3 text-[10px] text-white/90 font-medium">
              <span>Following</span>
              <span className="font-semibold">For You</span>
              <span>+</span>
            </div>
            <div className="flex-1" />
            <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3 text-white text-[9px]">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-white/20 mb-0.5" />
                <span>{card.likes}</span>
              </div>
              <span>{card.comments}</span>
              <span>12.8K</span>
            </div>
            <div className="px-3 pb-3 text-white">
              <p className="text-[10px] font-semibold">@{card.handle}</p>
              <p className="text-[9px] opacity-90 line-clamp-2 mt-0.5">
                {card.caption}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="px-2.5 pt-2.5 flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-white/30" />
              <div>
                <p className="text-[9px] font-semibold text-white">vimerai</p>
                <p className="text-[8px] text-white/80">Sponsored</p>
              </div>
            </div>
            <div className="flex-1 mx-2.5 my-2 rounded-lg bg-black/10" />
            <div className="px-2.5 pb-2.5 text-white">
              <p className="text-[9px] line-clamp-2">{card.caption}</p>
              <p className="text-[8px] text-white/70 mt-1">
                View all {card.comments} comments
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ContentCarousel({ className }: { className?: string }) {
  const loop = [...CARDS, ...CARDS];

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10" />
      <div className="flex gap-4 sm:gap-5 w-max animate-carousel-scroll py-2">
        {loop.map((card, i) => (
          <PhoneCard key={`${card.caption}-${i}`} card={card} />
        ))}
      </div>
    </div>
  );
}
