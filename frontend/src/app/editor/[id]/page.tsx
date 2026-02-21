"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Save, Download, X, Loader2, Video as VideoIcon, FileText, Tag, ArrowLeft } from "lucide-react"
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
      router.push("/my-videos")
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

  // Stable color per tag (same tag name = same color)
  const tagColors = useMemo(
    () => [
      "bg-primary/15 text-primary border-primary/30",
      "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    ],
    []
  )
  const getTagStyle = (tag: string) => {
    const index = Math.abs(tag.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % tagColors.length
    return tagColors[index]
  }

  if (!video) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <div className="w-full flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading video...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">Edit Video</h1>
          <p className="text-muted-foreground text-sm">Update your video metadata and details</p>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Video Preview */}
          <div className="relative rounded-2xl border border-border/80 bg-card/80 dark:bg-card/60 backdrop-blur-sm p-6 shadow-lg ring-1 ring-white/5 dark:ring-white/5 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <VideoIcon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Video Preview</h2>
            </div>
            {video.videoUrl ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                <video
                  src={video.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            ) : video.previewUrl ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                <video
                  src={video.previewUrl}
                  controls
                  className="w-full h-full object-contain"
                />
                <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-600 dark:text-amber-400">
                  This is a preview video. Full video generation available after subscription.
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border">
                <VideoIcon className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Video not available</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="relative rounded-2xl border border-border/80 bg-card/80 dark:bg-card/60 backdrop-blur-sm p-6 shadow-lg ring-1 ring-white/5 dark:ring-white/5 space-y-6 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Video Information</h2>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Title</label>
              <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a descriptive title for your video"
                    className="w-full"
                  />
              <p className="text-xs text-muted-foreground">A clear title helps organize your videos</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Description</label>
              <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your video content, purpose, or any relevant details..."
                    className="w-full min-h-32 resize-none"
                  />
              <p className="text-xs text-muted-foreground">Add context about your video to help with organization</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-primary" />
                <label className="block text-sm font-medium text-foreground">Tags</label>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="default"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${getTagStyle(tag)} hover:opacity-90`}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="opacity-70 hover:opacity-100 transition-opacity rounded-full p-0.5 -mr-0.5"
                        aria-label={`Remove ${tag} tag`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {tags.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">No tags added yet. Add tags to categorize your video.</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-border">
            <Link href="/my-videos" className="block">
              <Button type="button" variant="outline" className="w-full sm:w-auto border-border hover:border-primary/50 hover:text-primary">
                <ArrowLeft className="w-4 h-4" />
                Back to My Videos
              </Button>
            </Link>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {video.videoUrl && (
                <a href={video.videoUrl} download className="block">
                  <Button type="button" variant="outline" className="w-full sm:w-auto gap-2 border-border hover:border-primary/50 hover:text-primary">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </a>
              )}
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2 w-full sm:w-auto"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
