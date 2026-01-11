"use client"

import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PromptStudioPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Generator
            </Link>
            <h1 className="text-4xl font-bold mb-2">Prompt Studio</h1>
            <p className="text-muted-foreground">
              Create and manage your video generation prompts
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Prompt Studio is coming soon. Use the Generator to create videos now.
            </p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                Go to Generator
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
