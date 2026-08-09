"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StudioSidebar } from "@/components/studio/studio-sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/lib/hooks/use-user";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !data?.user) {
      router.replace("/login");
    }
  }, [data?.user, isLoading, router]);

  if (isLoading || !data?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--studio-canvas)]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="studio-shell flex min-h-screen bg-[var(--studio-canvas)] text-[var(--studio-ink)]">
      <StudioSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[var(--studio-border)] bg-white/70 px-6 backdrop-blur">
          <p className="text-sm text-[var(--studio-muted)]">
            Create Posts and Videos separately after Business DNA
          </p>
          <span className="rounded-full bg-[var(--studio-chip)] px-3 py-1 text-xs font-medium text-[var(--studio-ink)]">
            Brand Studio
          </span>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
