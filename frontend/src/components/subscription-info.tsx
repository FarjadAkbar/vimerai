"use client";

import { CreditCard, Video, Zap } from "lucide-react";

interface SubscriptionInfoProps {
  plan: string;
  videosRemaining: number;
  singleShotCredits?: number;
  showCreditSource?: boolean;
}

export function SubscriptionInfo({
  plan,
  videosRemaining,
  singleShotCredits = 0,
  showCreditSource = false,
}: SubscriptionInfoProps) {
  const planDisplayName =
    plan === "creator"
      ? "AI Creator"
      : plan === "pro"
        ? "AI Pro Studio"
        : plan === "starter"
          ? "AI Starter"
          : plan.charAt(0).toUpperCase() + plan.slice(1);
  const totalCredits = videosRemaining + singleShotCredits;

  // Determine which credit will be consumed first (single shot > subscription)
  const willUseSingleShot = singleShotCredits > 0;

  return (
    <div className="mb-6 p-4 rounded-lg border border-border bg-gradient-to-br from-card to-card/50 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
            <p className="text-sm font-semibold capitalize">{planDisplayName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Credits</p>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-semibold">
                {videosRemaining > 0 && `${videosRemaining} plan`}
                {videosRemaining > 0 && singleShotCredits > 0 && " + "}
                {singleShotCredits > 0 &&
                  `${singleShotCredits} Single Shot${singleShotCredits !== 1 ? "s" : ""}`}
                {totalCredits === 0 && "0"}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              totalCredits > 5
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : totalCredits > 0
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-destructive/10 text-destructive"
            }`}
          >
            {totalCredits > 5 ? "Active" : totalCredits > 0 ? "Low" : "Expired"}
          </span>
        </div>
      </div>
      {/* Show which credit will be consumed next */}
      {showCreditSource && totalCredits > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Next generation will use:{" "}
              <span className="font-medium text-foreground">
                {willUseSingleShot ? "Single Shot credit" : "Plan credit"}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
