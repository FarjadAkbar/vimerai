"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Wand2, Clock, AlertCircle, Zap, Sparkles, X } from "lucide-react"
import { generateVideoSchema, type GenerateVideoInput } from "@/lib/auth/schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@/lib/hooks/use-user"
import { useGeneratePreview, useGenerationStatus } from "@/lib/hooks/use-generator"
import { useVideos } from "@/lib/hooks/use-videos"

export default function GeneratorPage() {
  const router = useRouter()
  const { data: userData } = useUser()
  // Only fetch videos if user is authenticated to avoid 401 redirect
  // Refetch every 5 seconds to catch new video generations from dashboard
  const { data: videosData } = useVideos(10, 0, !!userData?.user, 5000)
  const generatePreview = useGeneratePreview()
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  
  // Check if user has already used preview (only check if user is authenticated)
  const hasUsedPreview = userData?.user && videosData?.videos?.some((v) => v.previewUrl !== null) || false
  
  // Poll for status if there's a jobId
  const { data: statusData } = useGenerationStatus(jobId, !!jobId && !!userData?.user)

  const form = useForm<GenerateVideoInput>({
    resolver: zodResolver(generateVideoSchema),
    defaultValues: {
      prompt: "",
      mode: "fast",
    },
  })

  const onSubmit = useCallback(async (data: GenerateVideoInput) => {
    // If user is not authenticated, redirect to signup
    if (!userData?.user) {
      // Store the prompt in sessionStorage to restore after signup
      sessionStorage.setItem("pendingPrompt", data.prompt)
      router.push("/signup")
      return
    }

    // If user hasn't used preview yet, generate preview
    if (!hasUsedPreview) {
      try {
        const result = await generatePreview.mutateAsync({ prompt: data.prompt })
        // Preview generation now returns jobId for async status polling
        setJobId(result.jobId)
      } catch (error: unknown) {
        // If preview already used, redirect to pricing
        const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || ""
        if (errorMessage.includes("already used")) {
          // For Phase 1, redirect to pricing after preview is used
          router.push("/pricing")
        } else {
          form.setError("root", { 
            message: errorMessage || "Failed to generate preview. Please try again." 
          })
        }
      }
    } else {
      // Preview already used, redirect to pricing
      router.push("/pricing")
    }
  }, [userData, hasUsedPreview, generatePreview, router, form])

  const handlePreviewContinue = () => {
    setShowPreviewOverlay(false)
    setRedirectCountdown(null)
    // Redirect to pricing as per Phase 1 requirements
    router.push("/pricing")
  }

  // Restore jobId from most recent processing video if page was refreshed or new video appears
  // Now handles both preview and full video generation (both are async)
  useEffect(() => {
    if (userData?.user && videosData?.videos) {
      // Find the most recent video that's still processing (can be preview or full video)
      const processingVideo = videosData.videos.find(
        (v) => (v.status === "pending" || v.status === "processing")
      )
      if (processingVideo) {
        // Set jobId if it's different from current (allows updating when new video appears)
        if (jobId !== processingVideo.jobId) {
          // Use setTimeout to avoid synchronous setState
          setTimeout(() => {
            setJobId(processingVideo.jobId)
          }, 0)
        }
      } else if (jobId) {
        // If no processing video found but jobId is set, clear it (video completed/failed)
        // Only clear if status is final (completed or failed)
        const currentVideo = videosData.videos.find((v) => v.jobId === jobId)
        if (currentVideo && (currentVideo.status === "completed" || currentVideo.status === "failed")) {
          setTimeout(() => {
            setJobId(null)
          }, 0)
        }
      }
    }
  }, [userData, videosData, jobId])

  useEffect(() => {
    // Restore pending prompt after signup/login and auto-submit
    const pendingPrompt = sessionStorage.getItem("pendingPrompt")
    if (pendingPrompt && userData?.user) {
      form.setValue("prompt", pendingPrompt)
      sessionStorage.removeItem("pendingPrompt")
      
      // Auto-submit the form to generate preview after signup
      // Use setTimeout to ensure form state is updated
      const submitTimer = setTimeout(() => {
        const formData = form.getValues()
        onSubmit(formData)
      }, 100)
      
      return () => clearTimeout(submitTimer)
    }
    
    // If user has already used preview, redirect to pricing
    if (hasUsedPreview && userData?.user) {
      router.push("/pricing")
    }
  }, [userData, form, hasUsedPreview, router, onSubmit])

  // Show preview overlay when preview is completed
  useEffect(() => {
    if (statusData?.status === "completed" && statusData?.previewUrl && !showPreviewOverlay) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setPreviewUrl(statusData.previewUrl!)
        setShowPreviewOverlay(true)
        // Start countdown for automatic redirect (5 seconds)
        setRedirectCountdown(5)
      }, 0)
    }
  }, [statusData, showPreviewOverlay])

  // Auto-redirect timer for Smart Preview overlay
  useEffect(() => {
    if (!showPreviewOverlay || redirectCountdown === null) {
      return
    }

    if (redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (redirectCountdown === 0) {
      // Auto-redirect when countdown reaches 0
      // Use setTimeout to avoid synchronous setState in effect
      const redirectTimer = setTimeout(() => {
        setShowPreviewOverlay(false)
        setRedirectCountdown(null)
        router.push("/pricing")
      }, 0)

      return () => clearTimeout(redirectTimer)
    }
  }, [showPreviewOverlay, redirectCountdown, router])

  // Preview generation is now async, so check both preview mutation and status polling
  const isGenerating = generatePreview.isPending || (jobId && statusData?.status !== "completed" && statusData?.status !== "failed")
  
  // Find the processing video to display its status (can be preview or full video)
  const processingVideo = videosData?.videos?.find(
    (v) => v.jobId === jobId && (v.status === "pending" || v.status === "processing")
  )
  
  // Check if this is a preview generation (has previewUrl when completed)
  const isPreviewGeneration = processingVideo?.previewUrl !== null || statusData?.previewUrl !== undefined

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Vimerai</span>
          </Link>
          <div className="flex items-center gap-3">
            {userData?.user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="sm">
                    Pricing
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Create Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Generator Interface */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Create short videos for social media in seconds
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your text prompts into professional videos for Instagram, TikTok, and YouTube.
          </p>
        </div>

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
                      disabled={!!isGenerating}
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
                          <p className="text-xs text-muted-foreground">Perfect for social media. 2-5 min generation.</p>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 gap-2"
              disabled={!!isGenerating}
            >
              {isGenerating ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" /> 
                  {statusData?.status === "processing" ? "Processing Preview..." : statusData?.status === "pending" ? "Generating Preview..." : "Generating Preview..."}
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" /> Generate Video
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Status Display for Processing Videos (preview or full video) */}
        {jobId && statusData && processingVideo && (statusData.status === "pending" || statusData.status === "processing") && (
          <div className="mt-6 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="font-medium">
                  {isPreviewGeneration ? "Preview Generation in Progress" : "Video Generation in Progress"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {statusData.status === "processing" ? (isPreviewGeneration ? "Processing your preview..." : "Processing your video...") : "Starting generation..."}
                </p>
              </div>
              {!isPreviewGeneration && (
                <Link href="/dashboard/my-videos">
                  <Button size="sm" variant="outline">
                    View Status
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Info Text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Click &quot;Generate Video&quot; to see a smart preview. Full video generation available after subscription.
        </p>

        {/* Last 3 Videos (per execution doc) */}
        {userData?.user && videosData && videosData.videos.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Videos</h2>
              <Link href="/dashboard/my-videos">
                <Button variant="ghost" size="sm">
                  View All →
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {videosData.videos.slice(0, 3).map((video) => (
                <Link
                  key={video.id}
                  href="/dashboard/my-videos"
                  className="rounded-xl border border-border hover:border-primary/50 overflow-hidden transition-all group bg-card"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center relative overflow-hidden">
                    {video.videoUrl || video.previewUrl ? (
                      <video
                        src={video.videoUrl || video.previewUrl || undefined}
                        className="w-full h-full object-cover"
                        controls={false}
                      />
                    ) : (
                      <Zap className="w-12 h-12 text-primary/50 group-hover:text-primary transition-colors" />
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {video.status === "processing" && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Clock className="w-8 h-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-2 text-sm">
                      {video.prompt.substring(0, 60)}
                      {video.prompt.length > 60 && "..."}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {new Date(video.createdAt).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          video.status === "completed"
                            ? "bg-primary/10 text-primary"
                            : video.status === "processing"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : video.status === "failed"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {video.status}
                      </span>
                      {video.mode && (
                        <span className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
                          {video.mode}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Smart Preview Overlay */}
      {showPreviewOverlay && previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-background rounded-xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Smart Preview</h2>
                {redirectCountdown !== null && redirectCountdown > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Redirecting to pricing in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviewContinue}
              >
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
                <strong>This is a smart preview to demonstrate the generator&apos;s capabilities.</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Full video generation is available after subscription. Subscribe to create unlimited videos.
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
    </div>
  )
}
