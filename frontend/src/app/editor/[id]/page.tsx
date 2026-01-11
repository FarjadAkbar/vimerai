"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Download, X, Loader2 } from "lucide-react"
import { useVideos } from "@/lib/hooks/use-videos"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Header from "@/components/header"

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

  if (!video) {
    return (
      <>
        <Header />
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
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="w-full">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/my-videos"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Videos
              </Link>
              <h1 className="text-4xl font-bold mb-2">Edit Video</h1>
              <p className="text-muted-foreground">Update your video metadata and details</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Video Preview */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-xl font-semibold mb-4">Video Preview</h2>
                {video.videoUrl ? (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={video.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Video not available</p>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                <h2 className="text-xl font-semibold">Video Information</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter video description"
                    className="w-full min-h-32"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                      placeholder="Add a tag"
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-primary/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Link href="/my-videos" className="block">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <div className="flex gap-3">
                  {video.videoUrl && (
                    <a href={video.videoUrl} download>
                      <Button type="button" variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Download
                      </Button>
                    </a>
                  )}
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 gap-2"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
