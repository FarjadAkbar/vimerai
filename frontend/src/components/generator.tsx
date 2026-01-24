"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import {
  generateVideoSchema,
  type GenerateVideoInput,
} from "@/lib/auth/schema";
import { useUser } from "@/lib/hooks/use-user";
import {
  useGenerateVideo,
  useGenerationStatus,
} from "@/lib/hooks/use-generator";
import { useVideos } from "@/lib/hooks/use-videos";
import { useCurrentSubscription } from "@/lib/hooks/use-subscription";
import { VideoGrid } from "@/components/video-grid";
import { useQueryClient } from "@tanstack/react-query";
import { WordRotate } from "@/components/ui/word-rotate";
import { SmartPreviewModal } from "@/components/smart-preview-modal";
import { SubscriptionInfo } from "@/components/subscription-info";
import { GeneratorForm } from "@/components/generator-form";
import { NotificationModal } from "@/components/notification-modal";
import type { GeneratorProps, NotificationState } from "@/types/components.types";

export function Generator({
  mode = "preview",
  showPreviewOverlay = false,
  header,
  showSubscriptionInfo = false,
  showRecentVideos = false,
  onSuccess,
  className = "",
}: GeneratorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: userData } = useUser();
  const isLoggedIn = !!userData?.user;
  const { data: subscription, isLoading: subscriptionLoading } =
    useCurrentSubscription(isLoggedIn);
  const { data: videosData } = useVideos(
    showRecentVideos ? 10 : 1,
    0,
    isLoggedIn
  );
  const generateVideo = useGenerateVideo();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [blockedModal, setBlockedModal] = useState<NotificationState | null>(null);

  // Check if user has already used preview (only for preview mode)
  const hasUsedPreview = useMemo(
    () =>
    mode === "preview" &&
      localStorage.getItem('used_preview'),
    [mode]
  );

  // Poll for status if there's a jobId
  const { data: statusData } = useGenerationStatus(
    jobId,
    !!jobId && isLoggedIn
  );

  const form = useForm<GenerateVideoInput>({
    resolver: zodResolver(generateVideoSchema),
    defaultValues: {
      prompt: "",
      mode: "fast",
    },
  });
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const onSubmit = useCallback(
    async (data: GenerateVideoInput) => {
      // If user is not authenticated and preview mode, redirect to signup

      // For preview mode, check if user has already used preview
      if (mode === "preview") {
        if (!hasUsedPreview) {
            await delay(1000);
            setPreviewUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4");
            localStorage.setItem('used_preview', 'true');
        }
      } else {
        // Full video generation mode
        generateVideo.mutate(
          {
            data: {
              prompt: data.prompt,
              mode: data.mode,
            },
            type: "full",
          },
          {
            onSuccess: (response) => {
              setJobId(response.jobId);
              onSuccess?.(response.jobId);
            },
            onError: (error: unknown) => {
              const message =
                (error as { response?: { data?: { message?: string } } })
                  ?.response?.data?.message ||
                "Failed to generate video. Please try again.";
              
              // If limit reached, show notification with pricing CTA
              if (
                message.includes("limit reached") ||
                message.includes("limit")
              ) {
                setNotification({
                  type: "warning",
                  title: "Generation Limit Reached",
                  message: "You've reached your video generation limit. Please upgrade your plan to continue.",
                  action: {
                    label: "View Pricing",
                    onClick: () => {
                      setNotification(null);
                      router.push("/pricing");
                    },
                  },
                });
              } else {
                setNotification({
                  type: "error",
                  title: "Video Generation Failed",
                  message: message,
                  action: {
                    label: "Try Again",
                    onClick: () => {
                      setNotification(null);
                      form.reset();
                    },
                  },
                });
              }
            },
          }
        );
      }
    },
    [isLoggedIn, hasUsedPreview, generateVideo, router, form, mode, onSuccess]
  );

  const handlePreviewClose = useCallback(() => {
    setPreviewUrl(null);
  }, []);


  // Restore pending prompt after signup/login and auto-submit (preview mode only)
  useEffect(() => {
    if (mode === "preview") {
      const pendingPrompt = sessionStorage.getItem("pendingPrompt");
      if (pendingPrompt && isLoggedIn) {
        form.setValue("prompt", pendingPrompt);
        sessionStorage.removeItem("pendingPrompt");

        const submitTimer = setTimeout(() => {
          onSubmit(form.getValues());
        }, 100);

        return () => clearTimeout(submitTimer);
      }
    }
  }, [isLoggedIn, form, mode, onSubmit]);

  // Handle completion/failure: refresh data, show toast, show preview/video
  useEffect(() => {
    if (!jobId || !statusData?.status) return;

    const isCompleted = statusData.status === "completed";
    const isFailed = statusData.status === "failed";

    if (isCompleted) {
      // For preview mode, wait for completion then refresh and show
      if (mode === "preview") {
        const previewUrlFromStatus = statusData?.previewUrl || null;
        const videoUrlFromStatus = statusData?.videoUrl || null;

        // Only show preview if there's a previewUrl and no videoUrl, and we haven't shown this preview yet
        if (previewUrlFromStatus && !videoUrlFromStatus && previewUrlFromStatus !== previewUrl) {
          // First, refresh all data and wait for it to complete
          const refreshData = async () => {
            if (isLoggedIn) {
              await Promise.all([
                queryClient.refetchQueries({ queryKey: ["videos"] }),
                queryClient.refetchQueries({ queryKey: ["subscription", "current"] }),
              ]);
            }
            
            // After data refresh, show preview
            setPreviewUrl(previewUrlFromStatus);
          };

          refreshData();
        }
      }
      // For full mode, refresh data
      else if (mode === "full") {
        if (isLoggedIn) {
          queryClient.refetchQueries({ queryKey: ["videos"] });
          queryClient.refetchQueries({ queryKey: ["subscription", "current"] });
          queryClient.refetchQueries({ queryKey: ["generation-status", jobId] });

          // Defer state update to avoid cascading renders
      setTimeout(() => {
            setNotification({
              type: "success",
              title: "Video Generated!",
              message: "Your video has been generated successfully and is ready to view.",
              action: {
                label: "View My Videos",
                onClick: () => {
                  setNotification(null);
                  router.push("/my-videos");
                },
              },
            });
      }, 0);
        }
      }
    } else if (isFailed) {
      // Auto-hide preview overlay if generation failed (preview mode only)
      if (previewUrl && mode === "preview") {
        const hideTimer = setTimeout(() => {
          handlePreviewClose();
          router.push("/pricing");
        }, 2000);
        return () => clearTimeout(hideTimer);
      }
    }
  }, [
    jobId,
    statusData?.status,
    statusData?.previewUrl,
    statusData?.videoUrl,
    mode,
    isLoggedIn,
    queryClient,
    previewUrl,
    handlePreviewClose,
    router,
  ]);

  const isGenerating =
    generateVideo.isPending ||
    (!!jobId &&
      statusData?.status !== "completed" &&
      statusData?.status !== "failed");
  // Reset form after successful generation and data refresh
  useEffect(() => {
    if (statusData?.status === "completed") {
      // Wait a bit for data refresh to complete before resetting form
      const resetTimer = setTimeout(() => {
        form.reset({
          prompt: "",
          mode: "fast",
        });
        // Clear jobId and toast ref after form reset to allow new generation
        setJobId(null);
      }, 1500); // Wait 1.5 seconds to ensure data is refreshed
      return () => clearTimeout(resetTimer);
    }
  }, [statusData?.status, form]);

  const isPreviewGeneration = mode === "preview";

  // For full mode, check subscription limits
  const canGenerate = useMemo(() => {
    if (mode === "preview") {
      // Preview mode: can generate if not logged in (will redirect) or if logged in and hasn't used preview
      return !hasUsedPreview;
    }
    // Full mode: must be logged in and have subscription with remaining videos
    if (!isLoggedIn) return false;
    if (subscriptionLoading) return true; // Allow while loading
    return subscription ? subscription.videosRemaining > 0 : false;
  }, [mode, hasUsedPreview, subscriptionLoading, subscription, isLoggedIn]);

  // Get blocked state message and CTA
  const getBlockedStateInfo = useMemo(() => {
    // if (canGenerate) return null;

    if (mode === "preview") {
      // if (!isLoggedIn) {
      //   return {
      //     message: "Smart preview is available after signup. Full generation requires an active plan.",
      //     cta: { text: "Sign Up", href: "/signup" },
      //     variant: "default" as const,
      //   };
      // }
      // if (hasUsedPreview && !previewUrl) {
        return {
          message: "You've already used your smart preview. Subscribe to generate more videos.",
          cta: { text: "Upgrade Plan", href: "/pricing" },
          variant: "default" as const,
        };
      // }
    } else {
      // Full mode
      if (!isLoggedIn) {
        return {
          message: "Please sign up to generate videos. Full video generation requires an active subscription plan.",
          cta: { text: "Sign Up", href: "/signup" },
          variant: "default" as const,
        };
      }
      if (subscriptionLoading) return null;
      if (!subscription) {
        return {
          message: "Please subscribe to generate videos. Choose a plan to get started.",
          cta: { text: "Upgrade Plan", href: "/pricing" },
          variant: "destructive" as const,
        };
      }
      if (subscription.videosRemaining === 0) {
        return {
          message: "You've reached your video generation limit. Please subscribe to generate more videos.",
          cta: { text: "Upgrade Plan", href: "/pricing" },
          variant: "destructive" as const,
        };
      }
    }
    return null;
  }, [canGenerate, mode, hasUsedPreview, previewUrl, subscriptionLoading, subscription, isLoggedIn]);

  return (
    <>
      <div className={className}>
        {header}

        {/* Subscription Info */}
        {showSubscriptionInfo &&
          !subscriptionLoading &&
          subscription &&
          subscription.plan !== "free" && (
            <SubscriptionInfo
              plan={subscription.plan}
              videosRemaining={subscription.videosRemaining}
            />
          )}
          
        {/* Generator Form */}
        <GeneratorForm
          form={form}
          onSubmit={onSubmit}
          isGenerating={isGenerating}
          canGenerate={canGenerate}
          mode={mode}
          statusData={statusData}
          blockedReason={getBlockedStateInfo ? {
            message: getBlockedStateInfo.message,
            cta: getBlockedStateInfo.cta || { text: "View Pricing", href: "/pricing" }
          } : null}
          onBlockedClick={() => {
            if (getBlockedStateInfo) {
              // Determine appropriate title based on the blocked reason
              let title = "Generation Blocked";
              if (mode === "preview" && hasUsedPreview) {
                title = "Smart Preview Already Used";
              } else if (!isLoggedIn) {
                title = "Sign Up Required";
              } else if (!subscription || subscription.plan === "free") {
                title = "Subscription Required";
              } else if (subscription.videosRemaining === 0) {
                title = "Generation Limit Reached";
              }

              setBlockedModal({
                type: "warning",
                title: title,
                message: getBlockedStateInfo.message,
                action: {
                  label: getBlockedStateInfo.cta?.text || "Upgrade Plan",
                  onClick: () => {
                    setBlockedModal(null);
                    router.push(getBlockedStateInfo.cta?.href || "/pricing");
                  },
                },
              });
            }
          }}
        />

        {/* Status Display for Processing Videos - Always show while generating */}
        {isGenerating && (
            <div className="mt-6 p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 animate-spin text-primary" />
                <div className="flex-1">
                  <p className="font-medium">
                    {isPreviewGeneration
                      ? "Preview Generation in Progress"
                      : "Video Generation in Progress"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                  <WordRotate
                    words={[
                      "Analyzing your prompt...",
                      "Generating video content...",
                      "Processing frames...",
                      "Optimizing quality...",
                      "Finalizing your video...",
                    ]}
                    duration={2000}
                  />
                  </p>
                </div>
                {!isPreviewGeneration && (
                <Link href="/my-videos">
                    <Button size="sm" variant="outline">
                      View Status
                    </Button>
                  </Link>
                )}
              </div>
          </div>
        )}

        {/* Info Text (preview mode only) */}
        {mode === "preview" && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            {!isLoggedIn ? (
              <>
                Smart preview is available after{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  signup
                </Link>
                . Full generation requires an active plan{" "}
                <Link href="/pricing" className="text-primary hover:underline">
                  subscribe
                </Link>
                .
              </>
            ) : subscription?.plan === "free" ? (
              <>
                Click &quot;Generate Video&quot; to see a smart preview. Full video generation available after{" "}
                <Link href="/pricing" className="text-primary hover:underline">
                  subscription
                </Link>
                .
              </>
            ) : (
              "Click &quot;Generate Video&quot; to see a smart preview."
            )}
          </p>
        )}

        {/* Recent Videos - Show for logged-in users */}
        {showRecentVideos && isLoggedIn && videosData && videosData.videos && videosData.videos.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Videos</h2>
              <Link href="/my-videos">
                <Button variant="ghost" size="sm">
                  View All →
                </Button>
              </Link>
            </div>
            <VideoGrid
              limit={3}
              offset={0}
              enabled={isLoggedIn}
              showSearch={false}
              showActions={false}
              showHeader={false}
              gridCols="3"
            />
          </div>
        )}
      </div>
      {/* Smart Preview Modal */}
      {previewUrl && (
        <SmartPreviewModal
          previewUrl={previewUrl}
          onClose={handlePreviewClose}
        />
      )}
      {/* Notification Modal */}
      {notification && (
        <NotificationModal
          open={!!notification}
          onClose={() => setNotification(null)}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          action={notification.action}
          autoClose={notification.type === "success" ? 5000 : 0}
        />
      )}
      {/* Blocked State Modal */}
      {blockedModal && (
        <NotificationModal
          open={!!blockedModal}
          onClose={() => setBlockedModal(null)}
          type={blockedModal.type}
          title={blockedModal.title}
          message={blockedModal.message}
          action={blockedModal.action}
          autoClose={0}
        />
      )}
    </>
  );
}
