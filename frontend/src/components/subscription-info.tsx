"use client";

import { CreditCard, Video } from "lucide-react";

interface SubscriptionInfoProps {
  plan: string;
  videosRemaining: number;
}

export function SubscriptionInfo({ plan, videosRemaining }: SubscriptionInfoProps) {
  const planDisplayName = plan === "creator" ? "AI Creator" : plan.charAt(0).toUpperCase() + plan.slice(1);

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
            <p className="text-xs text-muted-foreground mb-1">Videos Remaining</p>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-semibold">{videosRemaining}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            videosRemaining > 5 
              ? "bg-green-500/10 text-green-600 dark:text-green-400" 
              : videosRemaining > 0 
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "bg-destructive/10 text-destructive"
          }`}>
            {videosRemaining > 5 ? "Active" : videosRemaining > 0 ? "Low" : "Expired"}
          </span>
        </div>
      </div>
    </div>
  );
}
