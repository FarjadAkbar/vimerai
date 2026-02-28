"use client";

import DarkVeil from "@/components/DarkVeil";
import { Generator } from "@/components/generator";
import { useAppState } from "@/lib/providers/app-state-provider";

export default function HomePage() {
  const { mode, isLoggedIn } = useAppState();

  return (
    <div className="min-h-screen bg-[#000000] relative overflow-x-hidden">
      <div className="fixed  inset-0 h-[500px] md:h-full pointer-events-none z-0 " style={{ backgroundSize: 'cover', backgroundPosition: 'center' }}>
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
            Create scroll-stopping product ads happens within seconds
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Turn your product idea into a short, ready-to-post video ad without filming or editing
          </p>
        </section>

        <section className="w-full">
          <Generator
            mode={mode}
            showRecentVideos={isLoggedIn}
            showSubscriptionInfo={false}
          />
        </section>
      </div>
    </div>
  );
}