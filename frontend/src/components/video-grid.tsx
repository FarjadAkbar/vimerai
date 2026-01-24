"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Play, Download, Trash2, Loader2, Video as VideoIcon, Search } from "lucide-react"
import { useVideos, useDeleteVideo, useDownloadVideo } from "@/lib/hooks/use-videos"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface VideoGridProps {
  limit?: number
  offset?: number
  enabled?: boolean
  showSearch?: boolean
  showActions?: boolean
  showHeader?: boolean
  headerTitle?: string
  headerAction?: React.ReactNode
  emptyMessage?: string
  emptyAction?: React.ReactNode
  gridCols?: "2" | "3"
  className?: string
}

export function VideoGrid({
  limit = 10,
  offset = 0,
  enabled = true,
  showSearch = false,
  showActions = false,
  showHeader = false,
  headerTitle = "Videos",
  headerAction,
  emptyMessage,
  emptyAction,
  gridCols = "3",
  className = "",
}: VideoGridProps) {
  const { data: videosData, isLoading: videosLoading } = useVideos(limit, offset, enabled)
  const deleteVideo = useDeleteVideo()
  const downloadVideo = useDownloadVideo()
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => {
    setVideoToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (videoToDelete) {
      deleteVideo.mutate(videoToDelete)
      setDeleteDialogOpen(false)
      setVideoToDelete(null)
    }
  }

  const handleDownload = async (id: string) => {
    downloadVideo.mutate(id, {
      onSuccess: async (data) => {
        if (data.downloadUrl && typeof window !== "undefined") {
          if (!data.downloadUrl) return;

          const res = await fetch(data.downloadUrl);
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
    
          const link = document.createElement("a");
          link.href = url;
          link.download = "video.mp4";
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);

        }
      },
    })
  }

  const videos = videosData?.videos || []
  // Filter out videos that are still generating (pending or processing)
  const completedVideos = videos.filter(
    (video) => video.status === "completed" || video.status === "failed"
  )
  const filteredVideos = searchQuery
    ? completedVideos.filter((video) =>
        video.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : completedVideos

  const gridColsClass = gridCols === "2" ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"

  return (
    <div className={className}>
      {/* Header */}
      {showHeader && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{headerTitle}</h1>
              {showSearch && (
                <p className="text-muted-foreground">Manage and organize your generated videos</p>
              )}
            </div>
            {headerAction}
          </div>

          {/* Search */}
          {showSearch && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>
      )}

      {/* Videos Grid */}
      {videosLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <VideoIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">
            {emptyMessage || (searchQuery ? "No videos found matching your search" : "No videos yet")}
          </p>
          {!searchQuery && emptyAction}
        </div>
      ) : (
        <>
          {showSearch && (
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredVideos.length} of {videos.length} videos
            </div>
          )}
          <div className={`grid ${gridColsClass} gap-6`}>
            {filteredVideos.map((video) => {
              const videoCard = (
                <div
                  key={video.id}
                  className="rounded-xl border border-border hover:border-primary/50 overflow-hidden transition-all group bg-card"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center relative overflow-hidden">
                    {(video.videoUrl || video.previewUrl) ? (
                      <video
                        src={video.videoUrl || video.previewUrl || undefined}
                        className="w-full h-full object-cover"
                        controls={false}
                      />
                    ) : (
                      <Play className="w-12 h-12 text-primary/50 group-hover:text-primary transition-colors" />
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {video.status === "processing" && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
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
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          video.status === "completed" || video.previewUrl
                            ? "bg-primary/10 text-primary"
                            : video.status === "processing"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : video.status === "failed"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {video.previewUrl ? "preview" : video.status}
                      </span>
                      {video.mode && (
                        <span className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
                          {video.mode}
                        </span>
                      )}
                    </div>
                    {showActions ? (
                      <div className="flex items-center gap-2">
                        {(video.status === "completed" || video.previewUrl) && (video.videoUrl || video.previewUrl) ? (
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
                            <Link href={`/editor/${video.id}`}>
                              <Button variant="outline" size="sm" className="bg-transparent">
                                Edit
                              </Button>
                            </Link>
                            <AlertDialog open={deleteDialogOpen && videoToDelete === video.id} onOpenChange={setDeleteDialogOpen}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent"
                                  onClick={() => handleDeleteClick(video.id)}
                                  disabled={deleteVideo.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Video</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this video? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteConfirm}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        ) : (
                          <>
                            <div className="flex-1 px-3 py-2 bg-primary/10 rounded-lg text-xs text-center text-primary">
                              {video.status === "processing" ? "Processing..." : video.status === "pending" ? "Pending..." : "Failed"}
                            </div>
                            <AlertDialog open={deleteDialogOpen && videoToDelete === video.id} onOpenChange={setDeleteDialogOpen}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent"
                                  onClick={() => handleDeleteClick(video.id)}
                                  disabled={deleteVideo.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Video</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this video? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteConfirm}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              )

              // If showActions is false, wrap in Link to my-videos page
              if (!showActions) {
                return (
                  <Link key={video.id} href="/my-videos">
                    {videoCard}
                  </Link>
                )
              }

              return videoCard
            })}
          </div>
        </>
      )}
    </div>
  )
}
