"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContentCarousel } from "@/components/marketing/content-carousel";
import { useUser } from "@/lib/hooks/use-user";
import { PRODUCT_PATH } from "@/lib/product-path";

export function LandingHero() {
  const { data: userData } = useUser();
  const ctaHref = userData?.user ? PRODUCT_PATH.posts : "/signup";
  const ctaLabel = userData?.user ? "Make a Post" : "Start Free Trial";

  return (
    <section className="relative pt-8 sm:pt-12 pb-4">
      <div
        className="pointer-events-none absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 w-[min(900px,90vw)] h-[320px] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(251,191,36,0.35), transparent 55%), radial-gradient(ellipse at 70% 50%, rgba(59,130,246,0.3), transparent 55%)",
        }}
      />

      <div className="relative text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.08]">
          Create 100+ Viral Videos{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #2563eb 0%, #7c3aed 35%, #eab308 100%)",
            }}
          >
            in 1 Minute
          </span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
          Vimerai turns trending content into brand assets you own, and exports
          them ready for every platform — posts and videos from one studio.
        </p>
        <div className="mt-8 flex justify-center">
          <Button
            asChild
            size="lg"
            className="h-12 px-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-base font-medium shadow-[0_0_0_1px_rgba(37,99,235,0.3),0_0_24px_rgba(234,179,8,0.15)]"
          >
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </div>

      <div className="relative mt-10 sm:mt-14">
        <ContentCarousel />
        <div className="flex justify-center gap-1.5 mt-6">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="w-2 h-2 rounded-full bg-neutral-300" />
          <span className="w-2 h-2 rounded-full bg-neutral-300" />
        </div>
      </div>
    </section>
  );
}
