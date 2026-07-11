"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { useBrandKits } from "@/lib/hooks/use-brand-kits";
import { useProducts } from "@/lib/hooks/use-products";
import {
  useCreateGeneration,
  useGeneration,
} from "@/lib/hooks/use-generations";
import { useUser } from "@/lib/hooks/use-user";
import {
  getApiErrorMessage,
  type GenerationRecord,
  type Goal,
} from "@/lib/api/generations.api";

const goals: { value: Goal; label: string }[] = [
  { value: "increase_sales", label: "Increase sales" },
  { value: "product_launch", label: "Product launch" },
  { value: "brand_awareness", label: "Brand awareness" },
];

const formSchema = z.object({
  productId: z.string().uuid("Select a Product"),
  brandKitId: z.string().optional(),
  goal: z.enum(["increase_sales", "product_launch", "brand_awareness"]),
  lengthTier: z.enum(["teaser", "promo"]),
  feedPlatform: z.enum(["instagram", "facebook"]),
  reelPlatform: z.enum(["instagram_reels", "tiktok"]),
  postImageMode: z.enum(["product_photo", "ai_image"]),
});

type FormInput = z.infer<typeof formSchema>;

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function ResultView({ generation }: { generation: GenerationRecord }) {
  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">
          Generation ready
        </h2>
        <span className="text-sm text-muted-foreground capitalize">
          {generation.status}
        </span>
      </div>

      {generation.socialPost && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Social Post
          </h3>
          {generation.socialPost.postImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={generation.socialPost.postImageUrl}
              alt="Post"
              className="max-h-64 w-full rounded-lg object-cover"
            />
          ) : null}
          <p className="text-lg font-semibold">{generation.socialPost.headline}</p>
          <p className="text-muted-foreground">{generation.socialPost.body}</p>
          <p className="text-sm">{generation.socialPost.caption}</p>
          <p className="text-sm text-muted-foreground">
            {generation.socialPost.hashtags.join(" ")}
          </p>
        </section>
      )}

      {generation.reelStoryboard && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Reel Storyboard
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Hook:</strong>{" "}
              {generation.reelStoryboard.hook}
            </li>
            <li>
              <strong className="text-foreground">Attention:</strong>{" "}
              {generation.reelStoryboard.attention}
            </li>
            <li>
              <strong className="text-foreground">Product:</strong>{" "}
              {generation.reelStoryboard.productDisplay}
            </li>
            <li>
              <strong className="text-foreground">Connection:</strong>{" "}
              {generation.reelStoryboard.viewerConnection}
            </li>
          </ul>
        </section>
      )}

      {generation.reelCaption && (
        <section className="space-y-2">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Reel caption
          </h3>
          <p className="text-sm">{generation.reelCaption}</p>
        </section>
      )}

      {generation.video?.videoUrl && (
        <section className="space-y-2">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Teaser video
          </h3>
          <video
            src={generation.video.videoUrl}
            controls
            className="w-full rounded-lg"
          />
        </section>
      )}
    </div>
  );
}

export function BrandGeneration() {
  const router = useRouter();
  const { data: userData } = useUser();
  const isLoggedIn = !!userData?.user;
  const { data: brandKitsData, isLoading: kitsLoading } =
    useBrandKits(isLoggedIn);
  const { data: productsData, isLoading: productsLoading } =
    useProducts(isLoggedIn);
  const createGeneration = useCreateGeneration();
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const { data: generationData, isLoading: generationLoading } = useGeneration(
    generationId,
    !!generationId,
  );

  const brandKits = brandKitsData?.brandKits ?? [];
  const products = productsData?.products ?? [];

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "",
      brandKitId: "",
      goal: "increase_sales",
      lengthTier: "teaser",
      feedPlatform: "instagram",
      reelPlatform: "instagram_reels",
      postImageMode: "product_photo",
    },
  });

  const selectedProductId = form.watch("productId");

  const linkedKitIds = useMemo(() => {
    const product = products.find((item) => item.id === selectedProductId);
    if (!product) return [];
    return product.brandKitIds.filter((id) =>
      brandKits.some((kit) => kit.id === id),
    );
  }, [brandKits, products, selectedProductId]);

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-border/60 bg-background/70 p-8 text-center space-y-4 backdrop-blur">
        <p className="text-muted-foreground">
          Sign in to generate Social Posts, Reel Storyboards, and Teaser videos
          from your Brand Kit and Products.
        </p>
        <Button onClick={() => router.push("/login")}>Sign in</Button>
      </div>
    );
  }

  if (kitsLoading || productsLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (brandKits.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-background/70 p-8 text-center space-y-4 backdrop-blur">
        <h2 className="text-xl font-semibold">Create a Brand Kit first</h2>
        <p className="text-muted-foreground">
          Generate needs your brand voice, colors, and tone before it can build
          a content bundle.
        </p>
        <Button asChild>
          <Link href="/brand-kits">Go to Brand Kits</Link>
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-background/70 p-8 text-center space-y-4 backdrop-blur">
        <h2 className="text-xl font-semibold">Add a Product</h2>
        <p className="text-muted-foreground">
          Pick a Product and a Goal to generate your Teaser bundle.
        </p>
        <Button asChild>
          <Link href="/products">Go to Products</Link>
        </Button>
      </div>
    );
  }

  if (generationId && generationData?.generation) {
    return (
      <div className="rounded-2xl border border-border/60 bg-background/70 p-6 sm:p-8 backdrop-blur space-y-6">
        <ResultView generation={generationData.generation} />
        <Button
          variant="outline"
          onClick={() => {
            setGenerationId(null);
            setError(null);
          }}
        >
          New Generation
        </Button>
      </div>
    );
  }

  if (generationId && generationLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Spinner />
        <p className="text-sm text-muted-foreground">Loading Generation…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-6 sm:p-8 backdrop-blur">
      <Form {...form}>
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit((values) => {
            setError(null);
            createGeneration.mutate(
              {
                productId: values.productId,
                brandKitId: values.brandKitId || undefined,
                goal: values.goal,
                lengthTier: values.lengthTier,
                feedPlatform: values.feedPlatform,
                reelPlatform: values.reelPlatform,
                postImageMode: values.postImageMode,
              },
              {
                onSuccess: (result) => setGenerationId(result.generationId),
                onError: (err) =>
                  setError(
                    getApiErrorMessage(err, "Could not create Generation"),
                  ),
              },
            );
          })}
        >
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product</FormLabel>
                <FormControl>
                  <select {...field} className={selectClassName}>
                    <option value="">Select a Product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {linkedKitIds.length > 1 && (
            <FormField
              control={form.control}
              name="brandKitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Kit</FormLabel>
                  <FormControl>
                    <select {...field} className={selectClassName}>
                      <option value="">Select a Brand Kit</option>
                      {linkedKitIds.map((id) => {
                        const kit = brandKits.find((item) => item.id === id);
                        return (
                          <option key={id} value={id}>
                            {kit?.name ?? id}
                          </option>
                        );
                      })}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal</FormLabel>
                <FormControl>
                  <select {...field} className={selectClassName}>
                    {goals.map((goal) => (
                      <option key={goal.value} value={goal.value}>
                        {goal.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <button
              type="button"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => setShowOptions((open) => !open)}
            >
              {showOptions ? "Hide options" : "Options"}
            </button>
            {showOptions && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="lengthTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length</FormLabel>
                      <FormControl>
                        <select {...field} className={selectClassName}>
                          <option value="teaser">Teaser (~8–10s)</option>
                          <option value="promo" disabled>
                            Promo (coming soon)
                          </option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="feedPlatform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feed</FormLabel>
                      <FormControl>
                        <select {...field} className={selectClassName}>
                          <option value="instagram">Instagram</option>
                          <option value="facebook">Facebook</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reelPlatform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reel</FormLabel>
                      <FormControl>
                        <select {...field} className={selectClassName}>
                          <option value="instagram_reels">IG Reels</option>
                          <option value="tiktok">TikTok</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postImageMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post image</FormLabel>
                      <FormControl>
                        <select {...field} className={selectClassName}>
                          <option value="product_photo">Product photo</option>
                          <option value="ai_image" disabled>
                            AI image (coming soon)
                          </option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={createGeneration.isPending}
          >
            {createGeneration.isPending ? "Generating…" : "Generate"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
