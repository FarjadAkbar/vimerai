"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Download, X, Loader2 } from "lucide-react"
import { useVideos } from "@/lib/hooks/use-videos"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function EditorPage() {
  const router = useRouter()
  const params = useParams()
  const videoId = params.id as string
  const { data: videosData } = useVideos(100, 0)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const video = videosData?.videos?.find((v) => v.id === videoId)

  useEffect(() => {
    if (video) {
      setTitle(video.prompt.substring(0, 50))
      setDescription("")
      setTags(["video", "generated"])
    }
  }, [video])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    // TODO: Implement save functionality
    setTimeout(() => {
      setIsSaving(false)
      router.push("/dashboard/my-videos")
    }, 1000)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  if (!video) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/my-videos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Videos
          </Link>
          <h1 className="text-4xl font-bold mb-2">Edit Video</h1>
          <p className="text-muted-foreground">Make changes to your video and preview before saving</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 flex flex-col items-center justify-center gap-4 relative">
                {video.videoUrl ? (
                  <video
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">Video Preview</p>
                      <p className="text-sm text-muted-foreground mt-1">ID: {video.id}</p>
                    </div>
                    {video.status === "processing" && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Video Info */}
            <div className="p-6 bg-card rounded-xl border border-border">
              <h3 className="font-semibold mb-4">Video Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      video.status === "completed"
                        ? "bg-primary/10 text-primary"
                        : video.status === "processing"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {video.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-sm">{new Date(video.createdAt).toLocaleString()}</p>
                </div>
                {video.mode && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Mode</p>
                    <p className="text-sm capitalize">{video.mode}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Panel */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSave} className="space-y-6 sticky top-24">
              <div className="p-6 bg-card rounded-xl border border-border space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Video Title</label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tag..."
                      className="text-sm"
                    />
                    <Button type="button" size="sm" variant="outline" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full flex items-center gap-2"
                      >
                        {tag}
                        <X
                          className="w-3 h-3 cursor-pointer hover:opacity-70"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 gap-2"
                    disabled={isSaving || !title.trim()}
                  >
                    <Save className="w-5 h-5" /> {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  {video.videoUrl && (
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        if (video.videoUrl) {
                          window.open(video.videoUrl, "_blank")
                        }
                      }}
                    >
                      <Download className="w-5 h-5" /> Download Video
                    </Button>
                  )}
                  <Link href="/dashboard/my-videos" className="block">
                    <Button type="button" size="lg" variant="outline" className="w-full">
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

