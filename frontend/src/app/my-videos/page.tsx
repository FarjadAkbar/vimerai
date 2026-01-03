"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, LogOut, Settings, Plus, Play, Download, Trash2, Loader2 } from "lucide-react"
import { useUser } from "@/lib/hooks/use-user"
import { useVideos, useDeleteVideo, useDownloadVideo } from "@/lib/hooks/use-videos"
import { useLogout } from "@/lib/hooks/use-auth"
import { useQueryClient } from "@tanstack/react-query"

export default function MyVideosPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: userData, isLoading: userLoading } = useUser()
  const { data: videosData, isLoading: videosLoading } = useVideos(10, 0)
  const deleteVideo = useDeleteVideo()
  const downloadVideo = useDownloadVideo()
  const logout = useLogout()

  useEffect(() => {
    if (!userLoading && !userData) {
      router.push("/login")
    }
  }, [userData, userLoading, router])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      deleteVideo.mutate(id)
    }
  }

  const handleDownload = async (id: string) => {
    downloadVideo.mutate(id, {
      onSuccess: (data) => {
        if (data.downloadUrl && typeof window !== "undefined") {
          window.open(data.downloadUrl, "_blank")
        }
      },
    })
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  const videos = videosData?.videos || []

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
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{userData.user.email}</span>
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Create and manage your videos</p>
        </div>

        {/* Create New Video */}
        <div className="mb-12">
          <Link href="/generator">
            <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-5 h-5" /> Create New Video
            </Button>
          </Link>
        </div>

        {/* Recent Videos */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Videos</h2>
          {videosLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No videos yet. Create your first video!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="rounded-xl border border-border hover:border-primary/50 overflow-hidden transition-all group"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center relative overflow-hidden">
                    {video.videoUrl ? (
                      <video
                        src={video.videoUrl}
                        className="w-full h-full object-cover"
                        controls={false}
                      />
                    ) : (
                      <Play className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform" />
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-black/50 text-white text-xs rounded">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-1">{video.prompt.substring(0, 50)}</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {new Date(video.createdAt).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2">
                      {video.status === "completed" && video.videoUrl ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => handleDownload(video.id)}
                            disabled={downloadVideo.isPending}
                          >
                            <Download className="w-4 h-4" /> Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent"
                            onClick={() => handleDelete(video.id)}
                            disabled={deleteVideo.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex-1 px-3 py-2 bg-primary/10 rounded-lg text-xs text-center text-primary">
                          {video.status === "processing" ? "Processing..." : "Pending..."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
