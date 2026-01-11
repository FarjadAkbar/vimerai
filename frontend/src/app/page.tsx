import { Generator } from "@/components/generator";
import Header from '@/components/header'


export default function HomePage() {
  return (
    <>
    <Header />
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Create short videos for social media in seconds
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your text prompts into professional videos for Instagram,
            TikTok, and YouTube.
          </p>
        </div>

        <Generator
          mode="preview"
          showPreviewOverlay={true}
          showRecentVideos={true}
        />
      </div>
    </div>
    </>
  );
}
