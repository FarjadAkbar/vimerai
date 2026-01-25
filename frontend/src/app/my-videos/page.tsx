"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { VideoGrid } from "@/components/video-grid"

export default function MyVideosPage() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <VideoGrid
              limit={100}
              offset={0}
              showSearch={true}
              showActions={true}
              showHeader={true}
              headerTitle="My Videos"
              headerAction={
                <Link href="/">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="w-5 h-5" /> Create New Video
                  </Button>
                </Link>
              }
              emptyMessage="No videos yet"
              emptyAction={
                <Link href="/">
                  <Button className="mt-4 bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="w-5 h-5" /> Create Your First Video
                  </Button>
                </Link>
              }
              gridCols="3"
            />
          </div>
        </div>
      </div>
    </>
  )
}
