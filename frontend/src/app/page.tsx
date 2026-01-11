"use client"

import { Generator } from "@/components/generator";
import Header from '@/components/header'
import { useUser } from '@/lib/hooks/use-user'

export default function HomePage() {
  const { data: userData } = useUser()
  const isLoggedIn = !!userData?.user

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
            mode={isLoggedIn ? "full" : "preview"}
            showPreviewOverlay={!isLoggedIn}
            showRecentVideos={!isLoggedIn}
            showSubscriptionInfo={isLoggedIn}
          />
        </div>
      </div>
    </>
  );
}
