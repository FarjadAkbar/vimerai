"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Clock, Download } from "lucide-react";
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
import { storage } from "@/lib/utils/storage";
import { useActiveKit } from "@/lib/hooks/use-kit";
import {
  generatorApi,
  getApiErrorMessage,
} from "@/lib/api/generator.api";

function statusLabel(status: string | undefined, isSubmitting: boolean): {
  title: string;
  detail: string;
} {
  if (isSubmitting && !status) {
    return {
      title: "Submitting…",
      detail: "Sending your prompt to the generator",
    };
  }

  switch (status) {
    case "pending":
      return {
        title: "Queued…",
        detail: "Waiting for an available runner. This can take a few minutes.",
      };
    case "processing":
      return {
        title: "Generating…",
        detail: "Your video is being created. Keep this page open.",
      };
    default:
      return {
        title: "Video generation in progress",
        detail: "Working on your prompt",
      };
  }
}

export function Generator({
  mode = "preview",
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
  const { data: activeKit } = useActiveKit(isLoggedIn);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [completedJobId, setCompletedJobId] = useState<string | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [blockedModal, setBlockedModal] = useState<NotificationState | null>(null);
  const handledTerminalJobRef = useRef<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const hasUsedPreview = useMemo(
    () => mode === "preview" && storage.getUsedPreview(),
    [mode]
  );

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

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const revokeBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const clearResult = useCallback(() => {
    revokeBlobUrl();
    setResultVideoUrl(null);
    setCompletedJobId(null);
    setPlaybackUrl(null);
  }, [revokeBlobUrl]);

  const showGenerateError = useCallback(
    (error: unknown) => {
      const message = getApiErrorMessage(
        error,
        "Failed to generate video. Please try again."
      );

      if (message.toLowerCase().includes("limit")) {
        setNotification({
          type: "warning",
          title: "Generation Limit Reached",
          message:
            "You've reached your video generation limit. Please upgrade your plan to continue.",
          action: {
            label: "View Pricing",
            onClick: () => {
              setNotification(null);
              router.push("/pricing");
            },
          },
        });
        return;
      }

      setNotification({
        type: "error",
        title: "Video Generation Failed",
        message,
        action: {
          label: "Try Again",
          onClick: () => setNotification(null),
        },
      });
    },
    [router]
  );

  const canGenerate = useMemo(() => {
    if (mode === "preview") {
      if (isLoggedIn && !subscriptionLoading) {
        const singleShotCredits = subscription?.singleShotCredits ?? 0;
        const subscriptionCredits = subscription?.videosRemaining ?? 0;
        if (singleShotCredits > 0 || subscriptionCredits > 0) return true;
      }
      return !hasUsedPreview;
    }
    if (!isLoggedIn) return false;
    if (subscriptionLoading) return true;
    const subscriptionCredits = subscription?.videosRemaining ?? 0;
    const singleShotCredits = subscription?.singleShotCredits ?? 0;
    return subscriptionCredits > 0 || singleShotCredits > 0;
  }, [mode, hasUsedPreview, subscriptionLoading, subscription, isLoggedIn]);

  const startGeneration = useCallback(
    (data: GenerateVideoInput) => {
      clearResult();
      handledTerminalJobRef.current = null;
      generateVideo.mutate(
        {
          data: {
            prompt: data.prompt,
            mode: data.mode,
            shotTemplate: data.shotTemplate,
          },
          type: "full",
        },
        {
          onSuccess: (response) => {
            setJobId(response.jobId);
            onSuccess?.(response.jobId);
          },
          onError: showGenerateError,
        }
      );
    },
    [clearResult, generateVideo, onSuccess, showGenerateError]
  );

  const onSubmit = useCallback(
    async (data: GenerateVideoInput) => {
      if (mode === "preview") {
        const singleShotCredits = subscription?.singleShotCredits ?? 0;
        const subscriptionCredits = subscription?.videosRemaining ?? 0;
        const hasPaidCredits =
          isLoggedIn && (singleShotCredits > 0 || subscriptionCredits > 0);

        if (hasPaidCredits) {
          startGeneration(data);
        } else if (!hasUsedPreview) {
          await delay(1000);
          setPreviewUrl("https://lorem.video/720p");
          storage.setUsedPreview(true);
        }
        return;
      }

      startGeneration(data);
    },
    [isLoggedIn, hasUsedPreview, mode, startGeneration, subscription]
  );

  const handlePreviewClose = useCallback(() => {
    setPreviewUrl(null);
  }, []);

  const handleDownload = useCallback(async () => {
    const downloadJobId = completedJobId || jobId;
    if (!downloadJobId) return;

    setIsDownloading(true);
    try {
      const blob = await generatorApi.downloadVideo(downloadJobId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${downloadJobId}.mp4`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (error) {
      setNotification({
        type: "error",
        title: "Download Failed",
        message: getApiErrorMessage(
          error,
          "Could not download the video. Please try again."
        ),
        action: {
          label: "Dismiss",
          onClick: () => setNotification(null),
        },
      });
    } finally {
      setIsDownloading(false);
    }
  }, [completedJobId, jobId]);

  const handlePlaybackError = useCallback(async () => {
    const downloadJobId = completedJobId || jobId;
    if (!downloadJobId || blobUrlRef.current) return;

    try {
      const blob = await generatorApi.downloadVideo(downloadJobId);
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setPlaybackUrl(url);
    } catch {
      setNotification({
        type: "error",
        title: "Playback Failed",
        message:
          "Could not play the remote video. Try downloading it instead.",
        action: {
          label: "Download",
          onClick: () => {
            setNotification(null);
            void handleDownload();
          },
        },
      });
    }
  }, [completedJobId, jobId, handleDownload]);

  useEffect(() => {
    const savedPrompt = storage.getGeneratorPrompt();
    if (savedPrompt) {
      form.setValue("prompt", savedPrompt);
    }

    const subscriptionWatch = form.watch((value) => {
      storage.setGeneratorPrompt(value.prompt ?? "");
    });

    return () => subscriptionWatch.unsubscribe();
  }, [form]);

  useEffect(() => {
    return () => {
      revokeBlobUrl();
    };
  }, [revokeBlobUrl]);

  useEffect(() => {
    if (mode === "preview") {
      const pendingPrompt = storage.getPendingPrompt();
      if (pendingPrompt && isLoggedIn) {
        form.setValue("prompt", pendingPrompt);
        storage.clearPendingPrompt();

        const submitTimer = setTimeout(() => {
          onSubmit(form.getValues());
        }, 100);

        return () => clearTimeout(submitTimer);
      }
    }
  }, [isLoggedIn, form, mode, onSubmit]);

  useEffect(() => {
    if (!jobId || !statusData?.status) return;
    if (handledTerminalJobRef.current === jobId) return;

    const isCompleted = statusData.status === "completed";
    const isFailed = statusData.status === "failed";

    if (!isCompleted && !isFailed) return;

    handledTerminalJobRef.current = jobId;

    if (isCompleted) {
      const mediaUrl =
        statusData.videoUrl || statusData.previewUrl || null;

      if (isLoggedIn) {
        void queryClient.refetchQueries({ queryKey: ["videos"] });
        void queryClient.refetchQueries({
          queryKey: ["subscription", "current"],
        });
      }

      if (mode === "preview" && mediaUrl && !statusData.videoUrl) {
        setPreviewUrl(mediaUrl);
        setJobId(null);
        return;
      }

      if (mediaUrl) {
        setResultVideoUrl(mediaUrl);
        setPlaybackUrl(mediaUrl);
        setCompletedJobId(jobId);
      }

      setNotification({
        type: "success",
        title: "Video Generated!",
        message: "Your video is ready to play and download.",
        action: {
          label: "View My Videos",
          onClick: () => {
            setNotification(null);
            router.push("/my-videos");
          },
        },
      });

      form.reset({
        prompt: "",
        mode: "fast",
      });
      storage.setGeneratorPrompt("");
      setJobId(null);
      return;
    }

    setNotification({
      type: "error",
      title: "Video Generation Failed",
      message:
        statusData.error ||
        "Generation failed. You can update your prompt and try again.",
      action: {
        label: "Try Again",
        onClick: () => setNotification(null),
      },
    });
    setJobId(null);
  }, [
    jobId,
    statusData?.status,
    statusData?.previewUrl,
    statusData?.videoUrl,
    statusData?.error,
    mode,
    isLoggedIn,
    queryClient,
    router,
    form,
  ]);

  const isGenerating =
    generateVideo.isPending ||
    (!!jobId &&
      statusData?.status !== "completed" &&
      statusData?.status !== "failed");

  const progressCopy = statusLabel(
    statusData?.status,
    generateVideo.isPending
  );

  const getBlockedStateInfo = useMemo(() => {
    if (canGenerate) return null; // Credits hain toh block mat karo

    if (mode === "preview") {
      if (!isLoggedIn) {
        return {
          message:
            "Smart preview is available after signup. Full generation requires an active plan.",
          cta: { text: "Sign Up", href: "/signup" },
          variant: "default" as const,
        };
      }
      return {
        message:
          "You've already used your smart preview. Subscribe to generate more videos.",
        cta: { text: "Upgrade Plan", href: "/pricing" },
        variant: "default" as const,
      };
    }

    if (!isLoggedIn) {
      return {
        message:
          "Please sign up to generate videos. Full video generation requires an active subscription plan.",
        cta: { text: "Sign Up", href: "/signup" },
        variant: "default" as const,
      };
    }
    if (subscriptionLoading) return null;
    if (!subscription) {
      return {
        message:
          "Please subscribe to generate videos. Choose a plan to get started.",
        cta: { text: "Upgrade Plan", href: "/pricing" },
        variant: "destructive" as const,
      };
    }
    const subscriptionCredits = subscription.videosRemaining ?? 0;
    const singleShotCredits = subscription.singleShotCredits ?? 0;
    if (subscriptionCredits === 0 && singleShotCredits === 0) {
      return {
        message:
          "You've reached your video generation limit. Subscribe or buy a Single Shot to continue.",
        cta: { text: "Upgrade Plan", href: "/pricing" },
        variant: "destructive" as const,
      };
    }
    return null;
  }, [canGenerate, mode, isLoggedIn, subscriptionLoading, subscription]);

  return (
    <>
      <div className={className}>
        {header}

        {showSubscriptionInfo &&
          !subscriptionLoading &&
          subscription &&
          (subscription.plan !== "free" ||
            (subscription.singleShotCredits ?? 0) > 0) && (
            <SubscriptionInfo
              plan={subscription.plan}
              videosRemaining={subscription.videosRemaining}
              singleShotCredits={subscription.singleShotCredits}
              showCreditSource={mode === "full"}
            />
          )}

        <GeneratorForm
          form={form}
          onSubmit={onSubmit}
          isGenerating={isGenerating}
          canGenerate={canGenerate}
          mode={mode}
          activeKit={activeKit ?? null}
          statusData={statusData}
          blockedReason={
            getBlockedStateInfo
              ? {
                  message: getBlockedStateInfo.message,
                  cta: getBlockedStateInfo.cta || {
                    text: "View Pricing",
                    href: "/pricing",
                  },
                }
              : null
          }
          onBlockedClick={() => {
            if (getBlockedStateInfo) {
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

        {isGenerating && (
          <div className="mt-6 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="font-medium">{progressCopy.title}</p>
                <p className="text-sm text-muted-foreground">
                  {statusData?.status === "processing" ? (
                    <WordRotate
                      words={[
                        "Generating video content",
                        "Processing frames",
                        "Optimizing quality",
                        "Finalizing your video",
                      ]}
                      duration={2000}
                    />
                  ) : (
                    progressCopy.detail
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {playbackUrl && resultVideoUrl && (
          <div className="mt-6 p-4 rounded-xl border border-border bg-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">Your video is ready</p>
                <p className="text-sm text-muted-foreground">
                  Play below or download a copy via the server.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isDownloading || !(completedJobId || jobId)}
                onClick={() => void handleDownload()}
              >
                <Download className="w-4 h-4" />
                {isDownloading ? "Downloading…" : "Download"}
              </Button>
            </div>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                key={playbackUrl}
                src={playbackUrl}
                controls
                playsInline
                className="w-full h-full object-contain"
                onError={() => {
                  void handlePlaybackError();
                }}
              />
            </div>
          </div>
        )}

        {mode === "preview" && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            {!isLoggedIn ? (
              <>
                Smart preview is available after{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  signup
                </Link>{" "}
                Full generation requires an active{" "}
                <Link href="/pricing" className="text-primary hover:underline">
                  subscription
                </Link>
              </>
            ) : !subscription || subscription.plan === "free" ? (
              <>
                Click Generate Video to see a smart preview. Full video
                generation available after{" "}
                <Link href="/pricing" className="text-primary hover:underline">
                  subscribing
                </Link>
              </>
            ) : (
              "Describe your video and generate a clip"
            )}
          </p>
        )}

        {showRecentVideos &&
          isLoggedIn &&
          videosData &&
          videosData.videos &&
          videosData.videos.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recent Videos</h2>
                <Link href="/my-videos">
                  <Button variant="ghost" size="sm">
                    View All
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

      {previewUrl && (
        <SmartPreviewModal
          previewUrl={previewUrl}
          onClose={handlePreviewClose}
        />
      )}

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