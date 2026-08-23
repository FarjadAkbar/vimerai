"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { LandingHero } from "@/components/marketing/landing-hero";

function BrandMark({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className ?? ""}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white text-sm font-bold">
        V
      </div>
      <span className="text-xl font-bold tracking-tight text-neutral-900">
        Vimerai
      </span>
    </div>
  );
}

export function AuthShell({
  children,
  tagline = "Create 100+ viral-ready posts in minutes for 10x growth.",
}: {
  children: React.ReactNode;
  tagline?: string;
}) {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <div className="fixed inset-0 scale-105 blur-md opacity-40 pointer-events-none select-none">
        <LandingHero />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-2xl shadow-neutral-900/10">
          <div className="flex justify-end -mt-1 -mr-1 mb-2">
            <Link
              href="/"
              className="rounded-full p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Link>
          </div>

          <div className="text-center mb-6">
            <BrandMark className="justify-center" />
            <p className="mt-3 text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">
              {tagline}
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export { BrandMark };
