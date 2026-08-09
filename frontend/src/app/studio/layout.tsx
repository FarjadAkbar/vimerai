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
      <main className="min-w-0 flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
