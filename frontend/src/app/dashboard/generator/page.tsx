"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Wand2, Clock, AlertCircle, Zap, Film, Users, CheckCircle } from "lucide-react"
import { generateVideoSchema, type GenerateVideoInput } from "@/lib/auth/schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@/lib/hooks/use-user"
import { useGenerateVideo, useGenerationStatus } from "@/lib/hooks/use-generator"
import { useCurrentSubscription } from "@/lib/hooks/use-subscription"
import { useVideos } from "@/lib/hooks/use-videos"

export default function GeneratorPage() {
  const router = useRouter()
  const { data: userData, isLoading: userLoading } = useUser()
  const { data: subscription, isLoading: subscriptionLoading } = useCurrentSubscription()
  const generateVideo = useGenerateVideo()
  const [jobId, setJobId] = useState<string | null>(null)
  const { data: statusData } = useGenerationStatus(jobId, !!jobId)
  // Get recent videos to check for any processing videos after page refresh
  const { data: recentVideos } = useVideos(1, 0, !!userData?.user)

  const form = useForm<GenerateVideoInput>({
    resolver: zodResolver(generateVideoSchema),
    defaultValues: {
      prompt: "",
      mode: "fast",
    },
  })

  useEffect(() => {
    if (!userLoading && !userData) {
      router.push("/login")
    }
  }, [userData, userLoading, router])

  // Restore jobId from most recent processing video if page was refreshed
  useEffect(() => {
    if (userData?.user && recentVideos?.videos && !jobId) {
      // Find the most recent video that's still processing
      const processingVideo = recentVideos.videos.find(
        (v) => v.status === "pending" || v.status === "processing"
      )
      if (processingVideo) {
        // Restore polling for this video
        setJobId(processingVideo.jobId)
      }
    }
  }, [userData, recentVideos, jobId])
 
  const onSubmit = async (data: GenerateVideoInput) => {
    generateVideo.mutate(
      { prompt: data.prompt, mode: data.mode },
      {
        onSuccess: (response) => {
          // Start polling for status
          setJobId(response.jobId)
        },
        onError: (error: unknown) => {
          const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Failed to generate video. Please try again."
          form.setError("root", { message })
        },
      },
    )
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return null
  }
  
  const isGenerating = generateVideo.isPending || (jobId && statusData?.status !== "completed" && statusData?.status !== "failed")
  // Only check canGenerate after subscription data has loaded
  // Don't show limit card while loading to avoid flickering
  const canGenerate =
  !subscriptionLoading &&
  subscription &&
  subscription.videosRemaining > 0;

const hasReachedLimit =
  !subscriptionLoading &&
  subscription &&
  subscription.videosRemaining === 0;

   


  const modes = [
    {
      value: "fast",
      label: "Fast Mode",
      description: "Perfect for social media. 2-5 min generation.",
      icon: Zap,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    // {
    //   value: "cinematic",
    //   label: "Cinematic Mode",
    //   description: "Premium quality. 4K-8K resolution.",
    //   icon: Film,
    //   color: "text-purple-500",
    //   bgColor: "bg-purple-500/10",
    //   disabled: true,
    // },
    // {
    //   value: "avatar",
    //   label: "Avatar Mode",
    //   description: "AI-powered avatars. Coming soon.",
    //   icon: Users,
    //   color: "text-blue-500",
    //   bgColor: "bg-blue-500/10",
    //   disabled: true,
    // },
  ]

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Create Your Video</h1>
          <p className="text-muted-foreground">
            Describe what you want and our AI will bring it to life
          </p>
          {subscription && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Videos remaining:</span>
              <span className="font-semibold text-primary">
                {subscription.videosRemaining} / {subscription.limit}
              </span>
            </div>
          )}
        </div>

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
              <Button size="sm" variant="outline">
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
                      disabled={isGenerating || !canGenerate}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Be as detailed as possible for best results (10-1000 characters)
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Generation Mode</FormLabel>
                  <FormControl>
                    <div className="grid md:grid-cols-3 gap-4">
                      {modes.map((mode) => (
                        <button
                          key={mode.value}
                          type="button"
                          onClick={() => !mode.disabled && field.onChange(mode.value)}
                          disabled={mode.disabled || isGenerating || !canGenerate}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            field.value === mode.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          } ${mode.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className={`w-10 h-10 ${mode.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                            <mode.icon className={`w-5 h-5 ${mode.color}`} />
                          </div>
                          <h3 className="font-semibold mb-1">{mode.label}</h3>
                          <p className="text-xs text-muted-foreground">{mode.description}</p>
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {statusData && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {statusData.status === "pending" || statusData.status === "processing" ? (
                    <Clock className="w-4 h-4 animate-spin text-primary" />
                  ) : statusData.status === "completed" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : null}
                  <span className="font-medium">Status: {statusData.status}</span>
                </div>
                {statusData.status === "pending" || statusData.status === "processing" ? (
                  <p className="text-sm text-muted-foreground">
                    Your video is being generated. This may take a few minutes...
                  </p>
                ) : statusData.status === "completed" ? (
                  <div className="space-y-2">
                    <p className="text-sm text-foreground font-medium">
                      ✅ Your video is ready!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You can view and download it from the My Videos page.
                    </p>
                    <Link href="/dashboard/my-videos">
                      <Button size="sm" variant="outline" className="mt-2">
                        View My Videos
                      </Button>
                    </Link>
                  </div>
                ) : statusData.status === "failed" ? (
                  <p className="text-sm text-destructive">
                    Video generation failed. Please try again.
                  </p>
                ) : null}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 gap-2"
              disabled={isGenerating || !canGenerate}
            >
              {isGenerating ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" /> 
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5"  /> Generate Video
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

