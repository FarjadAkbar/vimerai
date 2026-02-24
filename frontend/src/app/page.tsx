"use client";

import DarkVeil from "@/components/DarkVeil";
import { Generator } from "@/components/generator";
import { useAppState } from "@/lib/providers/app-state-provider";

export default function HomePage() {
  const { mode, isLoggedIn } = useAppState();

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <DarkVeil
          hueShift={0}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-16 sm:pb-20">
        <section className="text-center mb-10 sm:mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-2 text-foreground">
            Create short videos in seconds
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed min-h-[2.5rem] flex justify-center items-center">
             Transform your text prompts into short-form videos          
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
