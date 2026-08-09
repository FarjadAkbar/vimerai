"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { GenerationDetail } from "@/components/generation-detail";
import { useGeneration } from "@/lib/hooks/use-generations";
import { useUser } from "@/lib/hooks/use-user";
import { getApiErrorMessage } from "@/lib/api/generations.api";
import { PRODUCT_PATH } from "@/lib/product-path";

export default function GenerationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const generationId = params.id;
  const { data: userData } = useUser();
  const isLoggedIn = !!userData?.user;
  const { data, isLoading, isError, error } = useGeneration(
    generationId,
    isLoggedIn && !!generationId,
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
          <p className="text-muted-foreground">
            Sign in to open this Generation.
          </p>
          <Button onClick={() => router.push("/login")}>Sign in</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <Spinner />
        <p className="text-sm text-muted-foreground">Loading Generation…</p>
      </div>
    );
  }

  if (isError || !data?.generation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-16 text-center">
          <p className="text-destructive">
            {getApiErrorMessage(error, "Generation not found or not yours")}
          </p>
          <Button asChild variant="outline">
            <Link href={PRODUCT_PATH.studio}>Open Brand Studio</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/generations">← Legacy library</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={PRODUCT_PATH.studio}>Brand Studio</Link>
          </Button>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/70 p-6 sm:p-8 backdrop-blur">
          <GenerationDetail
            generation={data.generation}
            onNewGeneration={() => router.push(PRODUCT_PATH.studio)}
          />
        </div>
      </div>
    </div>
  );
}
