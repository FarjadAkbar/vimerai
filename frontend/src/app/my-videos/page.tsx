"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VideoGrid } from "@/components/video-grid";
import { PRODUCT_PATH } from "@/lib/product-path";

export default function MyVideosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16 pb-20">
        <VideoGrid
          limit={100}
          offset={0}
          showSearch={true}
          showActions={true}
          showHeader={true}
          headerTitle="My Videos"
          headerAction={
            <Link href={PRODUCT_PATH.videos} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 gap-2 font-medium w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                Make a Video
              </Button>
            </Link>
          }
          emptyMessage="You haven’t created any videos yet."
          emptyAction={
            <Link href={PRODUCT_PATH.videos}>
              <Button
                size="lg"
                className="mt-4 bg-primary hover:bg-primary/90 gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Make a Video
              </Button>
            </Link>
          }
          gridCols="3"
        />
      </div>
    </div>
  );
}
