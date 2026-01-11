"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
  Wand2,
  Clock,
  AlertCircle,
  Zap,
  X,
  CheckCircle,
} from "lucide-react";
import {
  generateVideoSchema,
  type GenerateVideoInput,
} from "@/lib/auth/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/lib/hooks/use-user";
import {
  useGenerateVideo,
  useGenerationStatus,
} from "@/lib/hooks/use-generator";
import { useVideos } from "@/lib/hooks/use-videos";
import { useCurrentSubscription } from "@/lib/hooks/use-subscription";
import { VideoGrid } from "@/components/video-grid";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WordRotate } from "@/components/ui/word-rotate";

interface GeneratorProps {
  mode?: "preview" | "full";
  showPreviewOverlay?: boolean;
  header?: React.ReactNode;
  showSubscriptionInfo?: boolean;
  showRecentVideos?: boolean;
  onSuccess?: (jobId: string) => void;
  className?: string;
}

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
  const { data: userData } = useUser();
  const { data: subscription, isLoading: subscriptionLoading } =
    useCurrentSubscription();
  const { data: videosData } = useVideos(
    showRecentVideos ? 10 : 1,
    0,
    !!userData?.user
  );
  const generateVideo = useGenerateVideo();
  const [showPreviewOverlayState, setShowPreviewOverlayState] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null
  );
  const [jobId, setJobId] = useState<string | null>(null);
  const [lastShownPreviewUrl, setLastShownPreviewUrl] = useState<string | null>(
    null
  );

  // Check if user has already used preview (only for preview mode)
  const hasUsedPreview =
    mode === "preview" &&
    (userData?.user &&
      videosData?.videos?.some((v) => v.previewUrl !== null)) ||
    false;

  // Poll for status if there's a jobId
  const { data: statusData } = useGenerationStatus(
    jobId,
    !!jobId && !!userData?.user
  );

  const form = useForm<GenerateVideoInput>({
    resolver: zodResolver(generateVideoSchema),
    defaultValues: {
      prompt: "",
      mode: "fast",
    },
  });

  const onSubmit = useCallback(
    async (data: GenerateVideoInput) => {
      // If user is not authenticated and preview mode, redirect to signup
      if (!userData?.user && mode === "preview") {
        sessionStorage.setItem("pendingPrompt", data.prompt);
        router.push("/signup");
        return;
      }

      // For preview mode, check if user has already used preview
      if (mode === "preview") {
        if (!hasUsedPreview) {
          try {
            const result = await generateVideo.mutateAsync({
              data: {
                prompt: data.prompt,
                mode: data.mode,
              },
              type: "preview",
            });
            setJobId(result.jobId);
            onSuccess?.(result.jobId);
          } catch (error: unknown) {
            const errorMessage =
              (error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "";
            if (errorMessage.includes("already used")) {
              toast.error(
                "Preview already used. Please subscribe to continue."
              );
              setTimeout(() => {
                router.push("/pricing");
              }, 1000);
            } else {
              form.setError("root", {
                message:
                  errorMessage || "Failed to generate preview. Please try again.",
              });
            }
          }
        } else {
          // Preview already used, redirect to pricing
          router.push("/pricing");
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
                (error as { response?: { data?: { message?: string } } })?.response
                  ?.data?.message ||
                "Failed to generate video. Please try again.";
              form.setError("root", { message });
              // If limit reached, redirect to pricing
              if (message.includes("limit reached") || message.includes("limit")) {
                router.push("/pricing");
              }
            },
          }
        );
      }
    },
    [userData, hasUsedPreview, generateVideo, router, form, mode, onSuccess]
  );

  const handlePreviewContinue = () => {
    setShowPreviewOverlayState(false);
    setRedirectCountdown(null);
    router.push("/pricing");
  };

  // Restore jobId from most recent processing video if page was refreshed
  useEffect(() => {
    if (userData?.user && videosData?.videos) {
      const processingVideo = videosData.videos.find(
        (v) => v.status === "pending" || v.status === "processing"
      );
      if (processingVideo) {
        if (jobId !== processingVideo.jobId) {
          setTimeout(() => {
            setJobId(processingVideo.jobId);
          }, 0);
        }
      } else if (jobId) {
        const currentVideo = videosData.videos.find((v) => v.jobId === jobId);
        if (
          currentVideo &&
          (currentVideo.status === "completed" || currentVideo.status === "failed")
        ) {
          setTimeout(() => {
            setJobId(null);
          }, 0);
        }
      }
    }
  }, [userData, videosData, jobId]);

  // Restore pending prompt after signup/login and auto-submit (preview mode only)
  useEffect(() => {
    if (mode === "preview") {
      const pendingPrompt = sessionStorage.getItem("pendingPrompt");
      if (pendingPrompt && userData?.user) {
        form.setValue("prompt", pendingPrompt);
        sessionStorage.removeItem("pendingPrompt");

        const submitTimer = setTimeout(() => {
          const formData = form.getValues();
          onSubmit(formData);
        }, 100);

        return () => clearTimeout(submitTimer);
      }
    }
  }, [userData, form, mode, onSubmit]);

  // Show preview overlay when preview is completed (preview mode only)
  useEffect(() => {
    if (
      showPreviewOverlay &&
      mode === "preview" &&
      statusData?.status === "completed" &&
      statusData?.previewUrl &&
      statusData.previewUrl !== lastShownPreviewUrl
    ) {
      setTimeout(() => {
        setPreviewUrl(statusData.previewUrl!);
        setShowPreviewOverlayState(true);
        setRedirectCountdown(10);
        setLastShownPreviewUrl(statusData.previewUrl!);
      }, 0);
    }
  }, [
    showPreviewOverlay,
    mode,
    statusData?.status,
    statusData?.previewUrl,
    lastShownPreviewUrl,
  ]);

  // Auto-redirect timer for Smart Preview overlay
  useEffect(() => {
    if (!showPreviewOverlayState || redirectCountdown === null) {
      return;
    }

    if (redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0) {
      const redirectTimer = setTimeout(() => {
        setShowPreviewOverlayState(false);
        setRedirectCountdown(null);
        setTimeout(() => {
          router.push("/pricing");
        }, 200);
      }, 0);

      return () => clearTimeout(redirectTimer);
    }
  }, [showPreviewOverlayState, redirectCountdown, router]);

  const isGenerating =
    generateVideo.isPending ||
    (jobId &&
      statusData?.status !== "completed" &&
      statusData?.status !== "failed");

  const processingVideo = videosData?.videos?.find(
    (v) => v.jobId === jobId && (v.status === "pending" || v.status === "processing")
  );

  const isPreviewGeneration =
    mode === "preview" &&
    (processingVideo?.previewUrl !== null ||
      statusData?.previewUrl !== undefined);

  // For full mode, check subscription limits
  const canGenerate =
    mode === "preview"
      ? !hasUsedPreview
      : subscriptionLoading
      ? true
      : subscription
      ? subscription.videosRemaining > 0
      : false;

  const hasReachedLimit =
    mode === "full" &&
    !subscriptionLoading &&
    subscription &&
    subscription.videosRemaining === 0;

  // Get tooltip message when generation is disabled
  const getDisabledTooltipMessage = () => {
    if (isGenerating) {
      return "Generation in progress...";
    }
    if (mode === "preview") {
      if (hasUsedPreview) {
        return "You've already used your preview. Subscribe to generate more videos.";
      }
      if (!userData?.user) {
        return "Please sign up to generate a preview video.";
      }
    } else {
      // Full mode
      if (!userData?.user) {
        return "Please sign up to generate videos.";
      }
      if (subscriptionLoading) {
        return "Loading subscription information...";
      }
      if (!subscription) {
        return "Please subscribe to generate videos.";
      }
      if (subscription.videosRemaining === 0) {
        return "You've reached your video generation limit. Please upgrade your plan.";
      }
    }
    return "";
  };

  const disabledTooltipMessage = getDisabledTooltipMessage();
  const showTooltip = !canGenerate && disabledTooltipMessage;

  return (
    <>
      <div className={className}>
        {header}

        {hasReachedLimit && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                You&apos;ve reached your video generation limit
              </p>
              <p className="text-xs text-destructive/80 mt-1">
                Please upgrade your plan to continue generating videos.
              </p>
            </div>
            <Link href="/pricing">
              <Button
                size="sm"
                variant="outline"
              >
                Upgrade
              </Button>
            </Link>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {form.formState.errors.root && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{form.formState.errors.root.message}</span>
              </div>
            )}

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="E.g., A professional product launch video for a new smartphone showing features like camera, battery life, and design..."
                      className="min-h-32"
                      {...field}
                      disabled={isGenerating || (mode === "full" && !canGenerate)}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Be as detailed as possible for best results (10-1000 characters)
                  </p>
                </FormItem>
              )}
            />

            {/* Fast Mode Only - Hidden Cinematic/Avatar as per Phase 1 */}
            <FormField
              control={form.control}
              name="mode"
              render={() => (
                <FormItem>
                  <FormLabel>Generation Mode</FormLabel>
                  <FormControl>
                    <div className="p-4 rounded-xl border-2 border-primary bg-primary/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Fast Mode</h3>
                          <p className="text-xs text-muted-foreground">
                            Perfect for social media. 2-5 min generation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showTooltip ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="w-full">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-primary hover:bg-primary/90 gap-2"
                      disabled={isGenerating || !canGenerate}
                    >
                      {isGenerating ? (
                        <>
                          <Clock className="w-5 h-5 animate-spin" />
                          {mode === "preview"
                            ? statusData?.status === "processing"
                              ? "Processing Preview..."
                              : statusData?.status === "pending"
                              ? "Generating Preview..."
                              : "Generating Preview..."
                            : "Generating..."}
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5" /> Generate Video
                        </>
                      )}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>{disabledTooltipMessage}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 gap-2"
                disabled={isGenerating || !canGenerate}
              >
                {isGenerating ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    {mode === "preview"
                      ? statusData?.status === "processing"
                        ? "Processing Preview..."
                        : statusData?.status === "pending"
                        ? "Generating Preview..."
                        : "Generating Preview..."
                      : "Generating..."}
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" /> Generate Video
                  </>
                )}
              </Button>
            )}
          </form>
        </Form>

        {/* Status Display for Processing Videos */}
        {jobId &&
          statusData &&
          processingVideo &&
          (statusData.status === "pending" || statusData.status === "processing") && (
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

        {/* Status Display for Completed Videos (full mode only) */}
        {mode === "full" && statusData && statusData.status === "completed" && (
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium">Status: {statusData.status}</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-foreground font-medium">
                ✅ Your video is ready!
              </p>
              <p className="text-sm text-muted-foreground">
                You can view and download it from the My Videos page.
              </p>
              <Link href="/my-videos">
                <Button size="sm" variant="outline" className="mt-2">
                  View My Videos
                </Button>
              </Link>
            </div>
          </div>
        )}

        {mode === "full" && statusData && statusData.status === "failed" && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              Video generation failed. Please try again.
            </p>
          </div>
        )}

        {/* Info Text (preview mode only) */}
        {mode === "preview" && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Click &quot;Generate Video&quot; to see a smart preview. Full video
            generation available after subscription.
          </p>
        )}

        {/* Subscription Info (full mode only) */}
        {showSubscriptionInfo && subscription && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Videos remaining:</span>
            <span className="font-semibold text-primary">
              {subscription.videosRemaining} / {subscription.limit}
            </span>
          </div>
        )}

        {/* Recent Videos (preview mode only) */}
        {showRecentVideos && userData?.user && (
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
              enabled={!!userData?.user}
              showSearch={false}
              showActions={false}
              showHeader={false}
              gridCols="3"
            />
          </div>
        )}
      </div>

      {/* Smart Preview Overlay */}
      {showPreviewOverlayState && previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-background rounded-xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Smart Preview</h2>
                {redirectCountdown !== null && redirectCountdown > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Redirecting to pricing in {redirectCountdown} second
                    {redirectCountdown !== 1 ? "s" : ""}...
                  </p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={handlePreviewContinue}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="aspect-video bg-black rounded-lg overflow-hidden">
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
                onClick={handlePreviewContinue}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                View Pricing Plans
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
