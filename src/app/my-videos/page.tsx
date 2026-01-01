"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, LogOut, Settings, Plus, Play, Download } from "lucide-react"
import type { User, Video } from "@/types"

export default function MyVideosPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [videos, setVideos] = useState<Video[]>([
    {
      id: "1",
      title: "Product Launch Video",
      duration: "2:34",
      created: "2 days ago",
      status: "completed",
      thumbnail: "#6B46C1",
    },
    {
      id: "2",
      title: "Social Media Intro",
      duration: "0:15",
      created: "1 week ago",
      status: "completed",
      thumbnail: "#8B5CF6",
    },
    {
      id: "3",
      title: "Tutorial Video",
      duration: "5:12",
      created: "2 weeks ago",
      status: "processing",
      thumbnail: "#7C3AED",
    },
  ])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
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
          <div className="grid md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="rounded-xl border border-border hover:border-primary/50 overflow-hidden transition-all group cursor-pointer"
              >
                <div
                  className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${video.thumbnail}, ${video.thumbnail}80)`,
                  }}
                >
                  <Play className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform" />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-black/50 text-white text-xs rounded">{video.duration}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-1">{video.title}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{video.created}</p>
                  <div className="flex items-center gap-2">
                    {video.status === "completed" ? (
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Download className="w-4 h-4" /> Download
                      </Button>
                    ) : (
                      <div className="flex-1 px-3 py-2 bg-primary/10 rounded-lg text-xs text-center text-primary">
                        Processing...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
