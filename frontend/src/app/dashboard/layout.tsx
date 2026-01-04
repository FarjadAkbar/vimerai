"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, LogOut, Settings, Plus, Video, Home, Zap } from "lucide-react"
import { useUser } from "@/lib/hooks/use-user"
import { useLogout } from "@/lib/hooks/use-auth"
import { useCurrentSubscription } from "@/lib/hooks/use-subscription"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: userData, isLoading: userLoading } = useUser()
  const { data: subscription } = useCurrentSubscription()
  const logout = useLogout()

  useEffect(() => {
    if (!userLoading && !userData) {
      router.push("/login")
    }
  }, [userData, userLoading, router])

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

  const userEmail = userData?.user?.email || "User"
  const videosRemaining = subscription?.videosRemaining || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Vimerai</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="w-4 h-4" /> Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/generator">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Create Video
                </Button>
              </Link>
              <Link href="/dashboard/my-videos">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Video className="w-4 h-4" /> My Videos
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {subscription && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {videosRemaining} videos left
                  </span>
                </div>
              )}
              <span className="hidden sm:block text-sm text-muted-foreground">{userEmail}</span>
              <Link href="/dashboard/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}

