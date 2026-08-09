"use client";

import Link from "next/link";
import DarkVeil from "@/components/DarkVeil";
import { BrandGeneration } from "@/components/brand-generation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/hooks/use-user";
import {
  LEGACY_GENERATION_PRIMARY,
  PRODUCT_PATH,
} from "@/lib/product-path";

const createPaths = [
  {
    href: PRODUCT_PATH.businessDna,
    title: "Business DNA",
    body: "Paste a business URL to extract Brand Overview and Business Details.",
  },
  {
    href: PRODUCT_PATH.posts,
    title: "Make a Post",
    body: "Pick Brand, Product, and Format — Export a feed Post image.",
  },
  {
    href: PRODUCT_PATH.videos,
    title: "Make a Video",
    body: "Run a separate Video Job for Reels or TikTok — Export the file.",
  },
] as const;

function LegacyGenerationHome() {
  return (
    <div className="min-h-screen bg-[#000000] relative overflow-x-hidden">
      <div
        className="fixed inset-0 h-[500px] md:h-full pointer-events-none z-0"
        style={{ backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <DarkVeil
          hueShift={0}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
        />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 sm:pt-16 sm:pb-24">
        <section className="w-full">
          <BrandGeneration />
        </section>
      </div>
    </div>
  );
}

function FetraCreateHome() {
  const { data: userData } = useUser();
  const isLoggedIn = !!userData?.user;
  const studioHref = isLoggedIn ? PRODUCT_PATH.studio : "/login";

  return (
    <div className="min-h-screen bg-[#000000] relative overflow-x-hidden">
      <div
        className="fixed inset-0 h-[500px] md:h-full pointer-events-none z-0"
        style={{ backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <DarkVeil
          hueShift={0}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 sm:pt-16 sm:pb-24">
        <section className="text-center mb-8 sm:mb-10">
          <h1 className="text-4xl md:text-5xl md:leading-15 font-bold tracking-tight text-balance mb-3 text-foreground">
            Brand Studio for Posts and Videos
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Start from Business DNA, then Make a Post or Make a Video as separate
            jobs — Export when you are ready.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href={studioHref}>Open Brand Studio</Link>
            </Button>
            {!isLoggedIn && (
              <Button asChild variant="outline" size="lg">
                <Link href="/signup">Sign up</Link>
              </Button>
            )}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {createPaths.map((item) => (
            <Link
              key={item.href}
              href={isLoggedIn ? item.href : "/login"}
              className="rounded-2xl border border-border/60 bg-background/40 p-5 text-left backdrop-blur transition hover:border-foreground/30"
            >
              <h2 className="text-lg font-semibold text-foreground">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.body}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

export default function HomePage() {
  if (LEGACY_GENERATION_PRIMARY) {
    return <LegacyGenerationHome />;
  }
  return <FetraCreateHome />;
}
