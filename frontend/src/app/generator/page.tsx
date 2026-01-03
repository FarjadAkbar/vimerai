"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowLeft, Wand2, Clock, Download, AlertCircle } from "lucide-react"
import { generateVideoSchema, type GenerateVideoInput } from "@/lib/auth/schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@/lib/hooks/use-user"
import { useGenerateVideo, useGenerationStatus } from "@/lib/hooks/use-generator"
import { useCurrentSubscription } from "@/lib/hooks/use-subscription"

export default function GeneratorPage() {
  const router = useRouter()
  const { data: userData, isLoading: userLoading } = useUser()
  const { data: subscription } = useCurrentSubscription()
  const generateVideo = useGenerateVideo()
  const [jobId, setJobId] = useState<string | null>(null)
  const { data: statusData } = useGenerationStatus(jobId, !!jobId)

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

  useEffect(() => {
    if (statusData?.status === "completed" && statusData.videoUrl) {
      // Video generation completed
      router.push("/my-videos")
    }
  }, [statusData, router])

  const onSubmit = async (data: GenerateVideoInput) => {
    generateVideo.mutate(
      { prompt: data.prompt, mode: data.mode },
      {
        onSuccess: (response) => {
          setJobId(response.jobId)
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message ||
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
  const canGenerate = subscription ? subscription.videosRemaining > 0 : false

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Vimerai</span>
          </div>
          <Link href="/my-videos">
            <Button variant="outline" className="gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" /> Back to My Videos
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Create Your Video</h1>
          <p className="text-muted-foreground">
            Describe what you want and our AI will bring it to life
          </p>
          {subscription && (
            <p className="text-sm text-muted-foreground mt-2">
              Videos remaining: {subscription.videosRemaining} / {subscription.limit}
            </p>
          )}
        </div>

        {!canGenerate && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">
              You've reached your video generation limit. Please upgrade your plan.
            </p>
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
                    <select
                      {...field}
                      className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      disabled={isGenerating || !canGenerate}
                    >
                      <option value="fast">Fast Mode</option>
                      <option value="cinematic">Cinematic Mode</option>
                      <option value="avatar">Avatar Mode</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {statusData && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span className="font-medium">Status: {statusData.status}</span>
                </div>
                {statusData.status === "processing" && (
                  <p className="text-sm text-muted-foreground">
                    Your video is being generated. This may take a few minutes...
                  </p>
                )}
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
                  <Clock className="w-5 h-5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" /> Generate Video
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
