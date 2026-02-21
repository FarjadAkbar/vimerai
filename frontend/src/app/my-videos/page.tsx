"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import { VideoGrid } from "@/components/video-grid"

export default function MyVideosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <VideoGrid
          limit={100}
          offset={0}
          showSearch={true}
          showActions={true}
          showHeader={true}
          headerTitle="My Videos"
          headerAction={
            <Link href="/">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2 font-medium">
                <Plus className="w-5 h-5" />
                Create New Video
              </Button>
            </Link>
          }
          emptyMessage="You haven’t created any videos yet."
          emptyAction={
            <Link href="/">
              <Button size="lg" className="mt-4 bg-primary hover:bg-primary/90 gap-2 font-medium">
                <Plus className="w-5 h-5" />
                Create Your First Video
              </Button>
            </Link>
          }
          gridCols="3"
        />
      </div>
    </div>
  )
}
