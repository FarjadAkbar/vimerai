"use client"

import { Generator } from "@/components/generator";
import Header from '@/components/header'
import { useUser } from '@/lib/hooks/use-user'
import { useCurrentSubscription } from '@/lib/hooks/use-subscription'

export default function HomePage() {
  const { data: userData } = useUser()
  const isLoggedIn = !!userData?.user
  const { data: subscription } = useCurrentSubscription(isLoggedIn)
  
  // Use "preview" mode if plan is "free", otherwise use "full" mode
  const mode = isLoggedIn 
    ? (subscription?.plan === "free" ? "preview" : "full")
    : "preview"

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!isLoggedIn && (
            <div className="mb-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Create short videos for social media in seconds
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transform your text prompts into professional videos for Instagram,
                TikTok, and YouTube.
              </p>
            </div>
          )}

          <Generator
            mode={mode}
            showPreviewOverlay={mode === "preview"}
            showRecentVideos={!isLoggedIn}
            showSubscriptionInfo={true}
          />
        </div>
      </div>
    </>
  );
}
