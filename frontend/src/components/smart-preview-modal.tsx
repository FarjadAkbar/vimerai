"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { SmartPreviewModalProps } from "@/types/components.types"

export function SmartPreviewModal({
  previewUrl,
  onClose,
}: SmartPreviewModalProps) {
  const router = useRouter()
  const [redirectCountdown, setRedirectCountdown] = useState<number>(5);
  const handleContinue = () => {
    onClose()
    setTimeout(() => {
      router.push("/pricing")
    }, 5000)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setRedirectCountdown(redirectCountdown - 1);
      if (redirectCountdown === 0) {
        router.push("/pricing")
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown, router]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-background rounded-xl border border-border p-4 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Smart Preview</h2>
            {redirectCountdown !== null && redirectCountdown > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Closing in {redirectCountdown} second
                {redirectCountdown !== 1 ? "s" : ""}...
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={handleContinue}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="aspect-video bg-black rounded-lg overflow-hidden max-w-md mx-auto">
          <video
            src={previewUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground mb-2">
            <strong>
              This is a smart preview to demonstrate the generator&apos;s
              capabilities.
            </strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Full video generation is available after subscription. Subscribe
            to create more videos.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleContinue}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            View Pricing Plans
          </Button>
        </div>
      </div>
    </div>
  )
}
