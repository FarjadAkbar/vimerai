"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Video, Plus, Zap, TrendingUp } from "lucide-react"
import { useUser } from "@/lib/hooks/use-user"
import { useVideos } from "@/lib/hooks/use-videos"
import { useCurrentSubscription } from "@/lib/hooks/use-subscription"
import { PricingModal } from "@/components/pricing-modal"
import { VideoGrid } from "@/components/video-grid"

export default function DashboardPage() {
  const { data: userData } = useUser()
  const { data: videosData } = useVideos(1, 0) // Just to get total count
  const { data: subscription, isLoading: subscriptionLoading } = useCurrentSubscription()
  const [showPricingModal, setShowPricingModal] = useState(false)

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
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary mt-2"
                  onClick={() => setShowPricingModal(true)}
                >
                  {subscription ? "Manage" : "Choose Plan"} →
                </Button>
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
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => setShowPricingModal(true)}
              >
                <Zap className="w-5 h-5" /> Upgrade Plan
              </Button>
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
          <VideoGrid
            limit={3}
            offset={0}
            enabled={!subscriptionLoading}
            showSearch={false}
            showActions={false}
            showHeader={false}
            emptyMessage="No videos yet"
            emptyAction={
              <Link href="/dashboard/generator">
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="w-5 h-5" /> Create Your First Video
                </Button>
              </Link>
            }
            gridCols="3"
          />
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal open={showPricingModal} onOpenChange={setShowPricingModal} />
    </div>
  )
}