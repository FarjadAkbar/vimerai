"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGenerations } from "@/lib/hooks/use-generations";
import { useUser } from "@/lib/hooks/use-user";
import type { GenerationLibraryItem } from "@/lib/api/generations.api";
import { PRODUCT_PATH } from "@/lib/product-path";

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
          <h1 className="text-2xl font-semibold">Legacy Generation library</h1>
          <p className="text-muted-foreground">
            Sign in to reopen past Generations. New creates use Brand Studio.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => router.push("/login")}>Sign in</Button>
            <Button asChild variant="outline">
              <Link href={PRODUCT_PATH.studio}>Brand Studio</Link>
            </Button>
          </div>
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
          <h1 className="text-2xl font-semibold">Legacy Generation library</h1>
          <p className="text-destructive">Could not load your Generations.</p>
          <Button asChild variant="outline">
            <Link href={PRODUCT_PATH.studio}>Open Brand Studio</Link>
          </Button>
        </div>
      </div>
    );
  }

  const generations = data?.generations ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          <p className="font-medium text-foreground">
            Legacy path — not the primary create experience
          </p>
          <p className="mt-1 text-muted-foreground">
            Make a Post and Make a Video live in Brand Studio with separate Post
            Job and Video Job history.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={PRODUCT_PATH.posts}>Make a Post</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={PRODUCT_PATH.videos}>Make a Video</Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Legacy Generation library
            </h1>
            <p className="text-sm text-muted-foreground">
              Read-only access to older multi-arm Generations. Prefer Brand Studio
              for new work.
            </p>
          </div>
          <Button asChild>
            <Link href={PRODUCT_PATH.studio}>Open Brand Studio</Link>
          </Button>
        </div>

        {generations.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-background/70 p-8 text-center space-y-4 backdrop-blur">
            <p className="text-muted-foreground">
              No legacy Generations. Start a Post Job or Video Job in Brand Studio.
            </p>
            <Button asChild>
              <Link href={PRODUCT_PATH.studio}>Brand Studio</Link>
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
