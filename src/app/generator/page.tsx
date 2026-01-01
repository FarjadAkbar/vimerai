"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowLeft, Wand2, Clock, Download } from "lucide-react"
import type { User, GeneratedVideo } from "@/types"

export default function GeneratorPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsGenerating(true)

    setTimeout(() => {
      setGeneratedVideo({
        id: Date.now().toString(),
        title: prompt.substring(0, 50),
      })
      setIsGenerating(false)
    }, 2000)
  }

  const handleEditVideo = () => {
    if (generatedVideo) {
      localStorage.setItem("videoToEdit", JSON.stringify(generatedVideo))
      router.push(`/editor/${generatedVideo.id}`)
    }
  }

  if (!user) {
    return null
  }

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
          <p className="text-muted-foreground">Describe what you want and our AI will bring it to life</p>
        </div>

        {!generatedVideo ? (
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Video Description</label>
              <textarea
                placeholder="E.g., A professional product launch video for a new smartphone showing features like camera, battery life, and design..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-32 px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-2">Be as detailed as possible for best results</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">Video Length</label>
                <select className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                  <option>15 seconds</option>
                  <option>30 seconds</option>
                  <option>1 minute</option>
                  <option>2 minutes</option>
                  <option>5 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Style</label>
                <select className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                  <option>Professional</option>
                  <option>Cinematic</option>
                  <option>Casual</option>
                  <option>Animated</option>
                  <option>Minimalist</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 gap-2"
              disabled={isGenerating || !prompt.trim()}
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

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                This is a demo. Video generation typically takes 2-5 minutes depending on length and complexity.
              </p>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Video Preview</p>
                  <p className="text-sm text-muted-foreground mt-2">ID: {generatedVideo.id}</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-card rounded-xl border border-border text-center">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Video Generated!</h2>
              <p className="text-muted-foreground mb-6">Your video is ready for download and editing</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                  <Download className="w-5 h-5" /> Download
                </Button>
                <Button size="lg" variant="outline" onClick={handleEditVideo} className="bg-transparent">
                  Edit Video
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => {
                    setGeneratedVideo(null)
                    setPrompt("")
                  }}
                >
                  Create Another
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
