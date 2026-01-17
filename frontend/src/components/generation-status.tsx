"use client";

import Link from "next/link";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerationStatusProps {
  status: "completed" | "failed";
  mode: "preview" | "full";
}

export function GenerationStatus({ status, mode }: GenerationStatusProps) {
  if (status === "completed") {
    return (
      <div className="mt-6 p-5 rounded-xl border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-base font-semibold text-green-700 dark:text-green-300 mb-1">
                Video Generation Complete!
              </h3>
              <p className="text-sm text-muted-foreground">
                {mode === "preview"
                  ? "Your preview video is ready. Subscribe to generate full videos."
                  : "Your video has been generated successfully and is ready to view."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mt-6 p-5 rounded-xl border-2 border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-base font-semibold text-destructive mb-1">
                Generation Failed
              </h3>
              <p className="text-sm text-muted-foreground">
                We encountered an issue while generating your video. Please try again or contact support if the problem persists.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
              <Link href="/my-videos">
                <Button size="sm" variant="ghost">
                  View My Videos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
