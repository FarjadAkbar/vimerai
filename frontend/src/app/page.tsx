"use client";

import DarkVeil from "@/components/DarkVeil";
import { Generator } from "@/components/generator";
import TextType from "@/components/TextType";
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-20 sm:pb-24">
        <section className="text-center mb-14 sm:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-5 text-foreground">
            Create short videos for social media in seconds
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your text prompts into professional videos for{" "}
            <TextType
              text={["Instagram.", "TikTok.", "YouTube."]}
              className="font-bold text-foreground"
              typingSpeed={85}
              pauseDuration={1550}
              showCursor
              cursorCharacter="|"
              deletingSpeed={50}
              variableSpeed={{ min: 60, max: 120 }}
              cursorBlinkDuration={0.5}
            />
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
