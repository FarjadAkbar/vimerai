"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowLeft, Save, Download, X } from "lucide-react"
import type { User, GeneratedVideo, EditorState } from "@/types"

export default function EditorPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [video, setVideo] = useState<GeneratedVideo | null>(null)
  const [editorState, setEditorState] = useState<EditorState>({
    video: null,
    title: "",
    description: "",
    tags: ["video", "generated"],
    isSaving: false,
  })
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))

    const videoData = localStorage.getItem("videoToEdit")
    if (videoData) {
      const parsedVideo = JSON.parse(videoData)
      setVideo(parsedVideo)
      setEditorState((prev) => ({
        ...prev,
        video: parsedVideo,
        title: parsedVideo.title,
      }))
      localStorage.removeItem("videoToEdit")
    }
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditorState((prev) => ({ ...prev, isSaving: true }))

    setTimeout(() => {
      setEditorState((prev) => ({ ...prev, isSaving: false }))
      router.push("/my-videos")
    }, 1000)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !editorState.tags.includes(newTag)) {
      setEditorState((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditorState((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  if (!user || !video) {
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
              <ArrowLeft className="w-4 h-4" /> Back to Videos
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Edit Video</h1>
          <p className="text-muted-foreground">Make changes to your video and preview before saving</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/30 to-primary/10 flex flex-col items-center justify-center gap-4">
                <Sparkles className="w-20 h-20 text-primary" />
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">Video Preview</p>
                  <p className="text-sm text-muted-foreground mt-1">ID: {video.id}</p>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2">
                  <Download className="w-4 h-4" /> Download Video
                </Button>
              </div>
            </div>

            {/* Video Timeline */}
            <div className="p-6 bg-card rounded-xl border border-border">
              <h3 className="font-semibold mb-4">Timeline</h3>
              <div className="space-y-3">
                <div className="h-12 bg-primary/20 rounded border border-primary/40 flex items-center px-3">
                  <span className="text-xs text-muted-foreground">Intro Scene - 0s - 5s</span>
                </div>
                <div className="h-12 bg-primary/20 rounded border border-primary/40 flex items-center px-3">
                  <span className="text-xs text-muted-foreground">Main Content - 5s - 35s</span>
                </div>
                <div className="h-12 bg-primary/20 rounded border border-primary/40 flex items-center px-3">
                  <span className="text-xs text-muted-foreground">Outro Scene - 35s - 40s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Panel */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSave} className="space-y-6 sticky top-24">
              <div className="p-6 bg-card rounded-xl border border-border space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Video Title</label>
                  <input
                    type="text"
                    value={editorState.title}
                    onChange={(e) => setEditorState((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="Enter video title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={editorState.description}
                    onChange={(e) => setEditorState((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full h-24 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                    placeholder="Add a description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                      placeholder="Add tag..."
                    />
                    <Button type="button" size="sm" variant="outline" onClick={handleAddTag} className="bg-transparent">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editorState.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full flex items-center gap-2"
                      >
                        {tag}
                        <X className="w-3 h-3 cursor-pointer hover:opacity-70" onClick={() => handleRemoveTag(tag)} />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 gap-2"
                    disabled={editorState.isSaving || !editorState.title.trim()}
                  >
                    <Save className="w-5 h-5" /> {editorState.isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Link href="/my-videos" className="block">
                    <Button type="button" size="lg" variant="outline" className="w-full bg-transparent">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
