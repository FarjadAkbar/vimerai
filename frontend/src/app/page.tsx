"use client";

import { useMemo } from "react";
import Header from "@/components/header";
import { Generator } from "@/components/generator";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/lib/hooks/use-user";

import { useCurrentSubscription } from "@/lib/hooks/use-subscription";

export default function HomePage() {
  const { data: userData, isLoading: userLoading } = useUser();

  // 🚫 DO NOT decide auth until loading finished
  const isLoggedIn = !userLoading && !!userData?.user;

  const {
    data: subscription,
    isLoading: subscriptionLoading,
  } = useCurrentSubscription(isLoggedIn);

  // 🔐 Global auth + subscription loading gate
  const isLoading =
    userLoading || (userData?.user && subscriptionLoading);

  // 🔁 Decide mode ONLY after auth is ready
  const mode = useMemo(() => {
    if (!isLoggedIn) return "preview";
    return subscription?.plan === "free" ? "preview" : "full";
  }, [isLoggedIn, subscription?.plan]);

  // ⛔ BLOCK ENTIRE PAGE until auth resolved
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* 🧠 Marketing content ONLY for logged out users */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Create short videos for social media in seconds
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transform your text prompts into professional videos for
                Instagram, TikTok, and YouTube.
              </p>
            </div>
        

          <Generator
            mode={mode}
            showPreviewOverlay={mode === "preview"}
            showRecentVideos={isLoggedIn}
            showSubscriptionInfo={false}
          />
        </div>
      </div>
    </>
  );
}
