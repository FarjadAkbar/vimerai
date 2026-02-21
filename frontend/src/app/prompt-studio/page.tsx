import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"

export default function PromptStudioPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <section className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
            Prompt Studio
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            Create, save, and reuse prompts for faster video generation.
          </p>
        </section>

        <div className="relative rounded-2xl border border-border/80 bg-card/80 dark:bg-card/60 backdrop-blur-sm p-8 sm:p-10 text-center shadow-lg ring-1 ring-white/5 dark:ring-white/5">
          <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Coming soon</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-2">
            Prompt Studio will let you save and organize your best prompts so you can reuse them in one click.
          </p>
          <p className="text-muted-foreground/80 text-sm mb-8">
            Use the Generator below to create videos in the meantime.
          </p>
          <Link href="/">
            <Button size="lg" className="bg-primary hover:bg-primary/90 font-medium gap-2">
              Go to Generator
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
