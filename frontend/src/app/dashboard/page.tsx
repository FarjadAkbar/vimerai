"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Video, Plus, Zap, TrendingUp, Clock, Loader2 } from "lucide-react"
import { useUser } from "@/lib/hooks/use-user"
import { useVideos } from "@/lib/hooks/use-videos"
import { useCurrentSubscription } from "@/lib/hooks/use-subscription"

export default function DashboardPage() {
  const { data: userData } = useUser()
  const { data: videosData, isLoading: videosLoading } = useVideos(3, 0)
  const { data: subscription, isLoading: subscriptionLoading } = useCurrentSubscription()

  const videos = videosData?.videos || []
  const videosRemaining = subscription?.videosRemaining || 0
  const totalVideos = subscription?.limit || 0
  const planName = subscription?.plan || "No Plan"
  const totalVideosCreated = videosData?.total || 0

  const stats = [
    {
      icon: Zap,
      label: "Current Plan",
      value: planName,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Video,
      label: "Videos Remaining",
      value: `${videosRemaining} / ${totalVideos}`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: TrendingUp,
      label: "Total Videos",
      value: totalVideosCreated.toString(),
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ]
console.log("vieos data",videos)
  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{userData?.user?.email ? `, ${userData.user.email.split("@")[0]}` : ""}!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold mb-2">{stat.value}</p>
              {stat.label === "Videos Remaining" && totalVideos > 0 && (
                <div className="w-full bg-muted rounded-full h-2 mt-4">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(videosRemaining / totalVideos) * 100}%` }}
                  />
                </div>
              )}
              {stat.label === "Current Plan" && (
                <Link href="/pricing">
                  <Button variant="link" className="p-0 h-auto text-primary mt-2">
                    {subscription ? "Manage" : "Choose Plan"} →
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/generator">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="w-5 h-5" /> Create New Video
              </Button>
            </Link>
            <Link href="/dashboard/my-videos">
              <Button size="lg" variant="outline" className="gap-2">
                <Video className="w-5 h-5" /> View All Videos
              </Button>
            </Link>
            {!subscription && (
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="gap-2">
                  <Zap className="w-5 h-5" /> Upgrade Plan
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Videos */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Videos</h2>
            <Link href="/dashboard/my-videos">
              <Button variant="ghost" size="sm">
                View All →
              </Button>
            </Link>
          </div>
          {}
          {videosLoading || subscriptionLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-border bg-card">
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No videos yet</p>
              <Link href="/dashboard/generator">
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="w-5 h-5" /> Create Your First Video
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              
              {videos.map((video) => (
                
                <Link
                  key={video.id}
                  href={`/dashboard/my-videos`}
                  
                  className="rounded-xl border border-border hover:border-primary/50 overflow-hidden transition-all group"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center relative">
                  
                    <Video  className="w-12 h-12 text-primary/50 group-hover:text-primary transition-colors" />
                    <video src={video.previewUrl!}></video>
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-black/50 text-white text-xs rounded">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-2">{video.prompt.substring(0, 60)}</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {new Date(video.createdAt).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
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
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

