"use client";

import { useMemo } from "react";
import { Generator } from "@/components/generator";
import Header from "@/components/header";
import { useUser } from "@/lib/hooks/use-user";
import { useCurrentSubscription } from "@/lib/hooks/use-subscription";
import { Spinner } from "@/components/ui/spinner";

export default function HomePage() {
  const { data: userData, isLoading: userLoading } = useUser();
  const isLoggedIn = !!userData?.user;
  const { data: subscription, isLoading: subscriptionLoading } =
    useCurrentSubscription(isLoggedIn);
  
  // Determine mode based on subscription plan
  const mode = useMemo(() => {
    if (!isLoggedIn) return "preview";
    return subscription?.plan === "free" ? "preview" : "full";
  }, [isLoggedIn, subscription?.plan]);

  // Show loading state only when necessary
  const isLoading = userLoading || (isLoggedIn && subscriptionLoading);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <Spinner className="w-10 h-10 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </>
    );
  }

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
                Transform your text prompts into professional videos for
                Instagram, TikTok, and YouTube.
              </p>
            </div>
          )}

          <Generator
            mode={mode}
            showPreviewOverlay={mode === "preview"}
            showRecentVideos={isLoggedIn}
            showSubscriptionInfo={true}
          />
        </div>
      </div>
    </>
  );
}