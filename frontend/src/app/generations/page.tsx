"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGenerations } from "@/lib/hooks/use-generations";
import { useUser } from "@/lib/hooks/use-user";
import type { GenerationLibraryItem } from "@/lib/api/generations.api";

const GOAL_LABELS: Record<GenerationLibraryItem["goal"], string> = {
  increase_sales: "Increase sales",
  product_launch: "Product launch",
  brand_awareness: "Brand awareness",
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function armSummary(item: GenerationLibraryItem): string {
  const failed = item.arms.filter((arm) => arm.status === "failed").length;
  const completed = item.arms.filter((arm) => arm.status === "completed").length;
  if (failed > 0) {
    return `${completed}/${item.arms.length} arms ok · ${failed} failed`;
  }
  return `${completed}/${item.arms.length} arms complete`;
}

export default function GenerationsLibraryPage() {
  const router = useRouter();
  const { data: userData } = useUser();
  const isLoggedIn = !!userData?.user;
  const { data, isLoading, isError } = useGenerations(isLoggedIn);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-semibold">Generation library</h1>
          <p className="text-muted-foreground">
            Sign in to reopen past Generations and Content Outputs.
          </p>
          <Button onClick={() => router.push("/login")}>Sign in</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-semibold">Generation library</h1>
          <p className="text-destructive">Could not load your Generations.</p>
        </div>
      </div>
    );
  }

  const generations = data?.generations ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Generation library
            </h1>
            <p className="text-sm text-muted-foreground">
              Reopen past Generations to edit, export, or retry failed arms.
            </p>
          </div>
          <Button asChild>
            <Link href="/">New Generation</Link>
          </Button>
        </div>

        {generations.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-background/70 p-8 text-center space-y-4 backdrop-blur">
            <p className="text-muted-foreground">
              No Generations yet. Create one from a Product and Goal.
            </p>
            <Button asChild>
              <Link href="/">Generate</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {generations.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/generations/${item.id}`}
                  className="block rounded-2xl border border-border/60 bg-background/70 px-5 py-4 backdrop-blur transition hover:border-foreground/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {item.productName}{" "}
                        <span className="text-muted-foreground font-normal">
                          · {item.brandKitName}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {GOAL_LABELS[item.goal]} · {item.lengthTier} ·{" "}
                        {item.status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {armSummary(item)} · {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">Open</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
