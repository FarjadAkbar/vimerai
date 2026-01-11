"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"
import { useUser } from "@/lib/hooks/use-user"
import { Generator } from "@/components/generator"

export default function GeneratorPage() {
  const router = useRouter()
  const { data: userData, isLoading: userLoading } = useUser()

  useEffect(() => {
    // Redirect to home (Generator) - no separate generator page needed
    router.replace("/")
  }, [router])

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Create Your Video</h1>
          <p className="text-muted-foreground">
            Describe what you want and our AI will bring it to life
          </p>
        </div>

        <Generator
          mode="full"
          showSubscriptionInfo={true}
          header={null}
        />
      </div>
    </div>
  )
}