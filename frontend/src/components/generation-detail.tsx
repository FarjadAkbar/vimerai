"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateGeneration, useRegenerateSection, useRegenerateShot, useRetryFailedArms, useRenderPostConcepts } from "@/lib/hooks/use-generations";
import {
  getApiErrorMessage,
  type GenerationArm,
  type GenerationRecord,
  type ManualEditStoryboardSceneRequest,
  type TextSectionKey,
  POSTS_ONLY_MAX_RENDER_SELECTION,
  TEXT_SECTION_REGEN_LIMIT,
} from "@/lib/api/generations.api";

const ARM_LABELS: Record<GenerationArm, string> = {
  "creative-brief": "Creative Brief",
  "social-post": "Social Post",
  "reel-storyboard": "Reel Storyboard",
  "reel-caption": "Reel caption",
  video: "Video",
  "post-concepts": "Post Concepts",
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function downloadFromUrl(url: string, filename: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return false;
  }
}

export function GenerationDetail({
  generation,
  onNewGeneration,
  newGenerationLabel = "Open Brand Studio",
}: {
  generation: GenerationRecord;
  onNewGeneration: () => void;
  /** CTA leaving legacy Generation detail; defaults to Brand Studio (ticket 05). */
  newGenerationLabel?: string;
}) {
  const updateGeneration = useUpdateGeneration();
  const regenerateSection = useRegenerateSection();
  const regenerateShot = useRegenerateShot();
  const retryFailedArms = useRetryFailedArms();
  const renderPostConcepts = useRenderPostConcepts();
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [cta, setCta] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [hook, setHook] = useState("");
  const [attention, setAttention] = useState("");
  const [productDisplay, setProductDisplay] = useState("");
  const [viewerConnection, setViewerConnection] = useState("");
  const [scenes, setScenes] = useState<ManualEditStoryboardSceneRequest[]>([]);
  const [reelCaption, setReelCaption] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regenTarget, setRegenTarget] = useState<string | null>(null);
  const [selectedConceptIds, setSelectedConceptIds] = useState<string[]>([]);

  const isPostsOnly = generation.path === "posts_only";
  const renderedConceptIds = new Set(
    (generation.socialPosts ?? [])
      .map((post) => post.conceptId)
      .filter(Boolean),
  );
  const remainingRenderSlots = Math.max(
    0,
    POSTS_ONLY_MAX_RENDER_SELECTION - renderedConceptIds.size,
  );

  useEffect(() => {
    setHeadline(generation.socialPost?.headline ?? "");
    setBody(generation.socialPost?.body ?? "");
    setCta(generation.socialPost?.cta ?? "");
    setCaption(generation.socialPost?.caption ?? "");
    setHashtags((generation.socialPost?.hashtags ?? []).join(" "));
    setHook(generation.reelStoryboard?.hook ?? "");
    setAttention(generation.reelStoryboard?.attention ?? "");
    setProductDisplay(generation.reelStoryboard?.productDisplay ?? "");
    setViewerConnection(generation.reelStoryboard?.viewerConnection ?? "");
    setScenes(
      (generation.reelStoryboard?.scenes ?? []).map((scene, index) => ({
        order: scene.order || index + 1,
        description: scene.description,
      })),
    );
    setReelCaption(generation.reelCaption ?? "");
    setSelectedConceptIds([]);
    setMessage(null);
    setError(null);
  }, [generation]);

  const runSectionRegen = (
    sectionKey: TextSectionKey,
    sceneOrder?: number,
  ) => {
    const target =
      sectionKey === "storyboard.scene"
        ? `${sectionKey}:${sceneOrder}`
        : sectionKey;
    setError(null);
    setMessage(null);
    setRegenTarget(target);
    regenerateSection.mutate(
      {
        id: generation.id,
        data: { sectionKey, sceneOrder },
      },
      {
        onSuccess: () =>
          setMessage("Section regenerated with live Brand Kit/Product"),
        onError: (err) =>
          setError(
            getApiErrorMessage(err, "Could not regenerate this section"),
          ),
        onSettled: () => setRegenTarget(null),
      },
    );
  };

  const SectionRegenButton = ({
    sectionKey,
    sceneOrder,
  }: {
    sectionKey: TextSectionKey;
    sceneOrder?: number;
  }) => {
    const target =
      sectionKey === "storyboard.scene"
        ? `${sectionKey}:${sceneOrder}`
        : sectionKey;
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        disabled={regenerateSection.isPending}
        onClick={() => runSectionRegen(sectionKey, sceneOrder)}
      >
        {regenTarget === target ? "Rewriting…" : "AI rewrite"}
      </Button>
    );
  };

  const moveScene = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= scenes.length) return;
    const next = [...scenes];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    setScenes(
      next.map((scene, orderIndex) => ({
        ...scene,
        order: orderIndex + 1,
      })),
    );
  };

  const save = () => {
    setError(null);
    setMessage(null);
    updateGeneration.mutate(
      {
        id: generation.id,
        data: {
          socialPost: generation.socialPost
            ? {
                headline,
                body,
                cta,
                caption,
                hashtags: hashtags
                  .split(/\s+/)
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              }
            : undefined,
          reelStoryboard: generation.reelStoryboard
            ? {
                hook,
                attention,
                productDisplay,
                viewerConnection,
                scenes,
              }
            : undefined,
          reelCaption: generation.reelCaption !== null ? reelCaption : undefined,
        },
      },
      {
        onSuccess: () => setMessage("Manual edits saved"),
        onError: (err) =>
          setError(getApiErrorMessage(err, "Could not save Manual edits")),
      },
    );
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Generation ready
          </h2>
          <p className="text-sm text-muted-foreground capitalize">
            {generation.status}
            {isPostsOnly
              ? " · Instagram posts"
              : ` · ${generation.lengthTier}`}{" "}
            · {generation.goal.replaceAll("_", " ")}
          </p>
          <p className="text-sm text-muted-foreground">
            Snapshot · Brand Kit {generation.snapshot.brandKit.name} (
            {generation.snapshot.brandKit.tone}) · Product{" "}
            {generation.snapshot.product.name}
            {generation.snapshot.product.price
              ? ` · ${generation.snapshot.product.price}`
              : ""}{" "}
            · Colors {generation.snapshot.brandKit.colors.primary}/
            {generation.snapshot.brandKit.colors.secondary}
          </p>
          <p className="text-sm text-muted-foreground">
            Manual edits free · AI rewrite fair-use{" "}
            {generation.textSectionRegenCount ?? 0}/{TEXT_SECTION_REGEN_LIMIT}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {generation.socialPost?.postImageUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                const saved = await downloadFromUrl(
                  generation.socialPost!.postImageUrl,
                  `post-${generation.id}.jpg`,
                );
                setMessage(
                  saved
                    ? "Post image downloaded"
                    : "Opened Post image (save from browser if download blocked)",
                );
              }}
            >
              Download Post image
            </Button>
          )}
          {generation.video?.videoUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                const saved = await downloadFromUrl(
                  generation.video!.videoUrl!,
                  `teaser-${generation.id}.mp4`,
                );
                setMessage(
                  saved
                    ? "Video downloaded"
                    : "Opened Video (save from browser if download blocked)",
                );
              }}
            >
              Download Video
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              const packageText = [
                headline,
                body,
                cta,
                caption,
                hashtags,
              ]
                .map((part) => part.trim())
                .filter(Boolean)
                .join("\n\n");
              const ok = await copyText(packageText);
              setMessage(
                ok ? "Feed caption package copied" : "Could not copy caption",
              );
            }}
            disabled={!caption && !headline}
          >
            Copy feed caption
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              const ok = await copyText(reelCaption);
              setMessage(
                ok ? "Reel caption copied" : "Could not copy Reel caption",
              );
            }}
            disabled={!reelCaption}
          >
            Copy Reel caption
          </Button>
        </div>
      </div>

      {generation.arms?.length > 0 && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Arms
            </h3>
            {generation.arms.some((arm) => arm.status === "failed") && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={retryFailedArms.isPending}
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  retryFailedArms.mutate(
                    { id: generation.id },
                    {
                      onSuccess: () =>
                        setMessage("Failed arms retried (no extra credit)"),
                      onError: (err) =>
                        setError(
                          getApiErrorMessage(err, "Could not retry failed arms"),
                        ),
                    },
                  );
                }}
              >
                {retryFailedArms.isPending
                  ? "Retrying…"
                  : "Retry all failed arms"}
              </Button>
            )}
          </div>
          <ul className="space-y-2">
            {generation.arms.map((arm) => (
              <li
                key={arm.arm}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium text-foreground">
                    {ARM_LABELS[arm.arm] ?? arm.arm}
                  </span>
                  <span className="ml-2 capitalize text-muted-foreground">
                    {arm.status}
                  </span>
                  {arm.error ? (
                    <p className="text-xs text-destructive">{arm.error}</p>
                  ) : null}
                </div>
                {arm.status === "failed" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={retryFailedArms.isPending}
                    onClick={() => {
                      setError(null);
                      setMessage(null);
                      retryFailedArms.mutate(
                        {
                          id: generation.id,
                          data: { arms: [arm.arm] },
                        },
                        {
                          onSuccess: () =>
                            setMessage(
                              `${ARM_LABELS[arm.arm] ?? arm.arm} retried`,
                            ),
                          onError: (err) =>
                            setError(
                              getApiErrorMessage(
                                err,
                                "Could not retry this arm",
                              ),
                            ),
                        },
                      );
                    }}
                  >
                    Retry
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {isPostsOnly && (generation.postConcepts?.length ?? 0) > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Post Concepts ({generation.postConcepts!.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Select up to {POSTS_ONLY_MAX_RENDER_SELECTION} total (
            {remainingRenderSlots} remaining) to render as full Instagram Social
            Posts with AI images.
          </p>
          <ul className="space-y-2">
            {generation.postConcepts!.map((concept, index) => {
              const rendered = renderedConceptIds.has(concept.id);
              const checked = selectedConceptIds.includes(concept.id);
              return (
                <li
                  key={concept.id}
                  className="rounded-lg border border-border/60 p-3 space-y-1"
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1"
                      disabled={
                        rendered ||
                        (!checked &&
                          selectedConceptIds.length >= remainingRenderSlots)
                      }
                      checked={checked || rendered}
                      onChange={(event) => {
                        if (rendered) return;
                        if (event.target.checked) {
                          if (
                            selectedConceptIds.length >= remainingRenderSlots
                          ) {
                            setError(
                              `Select at most ${POSTS_ONLY_MAX_RENDER_SELECTION} Post Concepts total`,
                            );
                            return;
                          }
                          setError(null);
                          setSelectedConceptIds((ids) => [...ids, concept.id]);
                        } else {
                          setSelectedConceptIds((ids) =>
                            ids.filter((id) => id !== concept.id),
                          );
                        }
                      }}
                    />
                    <span className="space-y-1 text-sm">
                      <span className="font-medium block">
                        {index + 1}. {concept.hook}
                        {rendered ? " · rendered" : ""}
                      </span>
                      <span className="block text-muted-foreground">
                        Visual: {concept.visualIdea}
                      </span>
                      <span className="block text-muted-foreground">
                        Angle: {concept.angle}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <Button
            type="button"
            disabled={
              selectedConceptIds.length === 0 ||
              remainingRenderSlots === 0 ||
              renderPostConcepts.isPending
            }
            onClick={() => {
              setError(null);
              setMessage(null);
              renderPostConcepts.mutate(
                {
                  id: generation.id,
                  data: { conceptIds: selectedConceptIds },
                },
                {
                  onSuccess: () => {
                    setSelectedConceptIds([]);
                    setMessage("Social Posts rendered with AI images");
                  },
                  onError: (err) =>
                    setError(
                      getApiErrorMessage(
                        err,
                        "Could not render selected Post Concepts",
                      ),
                    ),
                },
              );
            }}
          >
            {renderPostConcepts.isPending
              ? "Rendering…"
              : `Render ${selectedConceptIds.length || ""} Social Post${
                  selectedConceptIds.length === 1 ? "" : "s"
                }`}
          </Button>
        </section>
      )}

      {(generation.socialPosts?.length ?? 0) > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Rendered Social Posts ({generation.socialPosts!.length})
          </h3>
          {generation.socialPosts!.map((post, index) => (
            <div
              key={post.conceptId ?? `${post.headline}-${index}`}
              className="space-y-2 rounded-lg border border-border/60 p-3"
            >
              {post.postImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.postImageUrl}
                  alt={`Social Post ${index + 1}`}
                  className="max-h-64 w-full rounded-lg object-cover"
                />
              ) : null}
              <p className="font-medium">{post.headline}</p>
              <p className="text-sm whitespace-pre-wrap">{post.body}</p>
              <p className="text-sm">{post.cta}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {post.caption}
              </p>
              <p className="text-sm text-muted-foreground">
                {(post.hashtags ?? []).join(" ")}
              </p>
              {post.postImageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const saved = await downloadFromUrl(
                      post.postImageUrl,
                      `post-${generation.id}-${index + 1}.jpg`,
                    );
                    setMessage(
                      saved
                        ? "Post image downloaded"
                        : "Opened Post image (save from browser if download blocked)",
                    );
                  }}
                >
                  Download image
                </Button>
              )}
            </div>
          ))}
        </section>
      )}

      {!isPostsOnly && generation.socialPost && (
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
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="headline">Headline</Label>
              <SectionRegenButton sectionKey="social.headline" />
            </div>
            <Input
              id="headline"
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="body">Body</Label>
              <SectionRegenButton sectionKey="social.body" />
            </div>
            <Textarea
              id="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="cta">CTA</Label>
              <SectionRegenButton sectionKey="social.cta" />
            </div>
            <Input
              id="cta"
              value={cta}
              onChange={(event) => setCta(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="caption">Caption</Label>
              <SectionRegenButton sectionKey="social.caption" />
            </div>
            <Textarea
              id="caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="hashtags">Hashtags</Label>
              <SectionRegenButton sectionKey="social.hashtags" />
            </div>
            <Input
              id="hashtags"
              value={hashtags}
              onChange={(event) => setHashtags(event.target.value)}
              placeholder="#brand #product"
            />
          </div>
        </section>
      )}

      {generation.reelStoryboard && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Reel Storyboard
          </h3>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="hook">Hook</Label>
              <SectionRegenButton sectionKey="storyboard.hook" />
            </div>
            <Textarea
              id="hook"
              value={hook}
              onChange={(event) => setHook(event.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="attention">Attention</Label>
              <SectionRegenButton sectionKey="storyboard.attention" />
            </div>
            <Textarea
              id="attention"
              value={attention}
              onChange={(event) => setAttention(event.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="productDisplay">Product display</Label>
              <SectionRegenButton sectionKey="storyboard.productDisplay" />
            </div>
            <Textarea
              id="productDisplay"
              value={productDisplay}
              onChange={(event) => setProductDisplay(event.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="viewerConnection">Viewer connection</Label>
              <SectionRegenButton sectionKey="storyboard.viewerConnection" />
            </div>
            <Textarea
              id="viewerConnection"
              value={viewerConnection}
              onChange={(event) => setViewerConnection(event.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Scenes</Label>
            {scenes.map((scene, index) => (
              <div
                key={`${scene.order}-${index}`}
                className="flex flex-col gap-2 rounded-md border border-border/60 p-3 sm:flex-row sm:items-start"
              >
                <Textarea
                  value={scene.description}
                  onChange={(event) => {
                    const next = [...scenes];
                    next[index] = {
                      ...next[index],
                      description: event.target.value,
                    };
                    setScenes(next);
                  }}
                  rows={2}
                  className="flex-1"
                />
                <div className="flex flex-wrap gap-2">
                  <SectionRegenButton
                    sectionKey="storyboard.scene"
                    sceneOrder={scene.order}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveScene(index, -1)}
                    disabled={index === 0}
                  >
                    Up
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveScene(index, 1)}
                    disabled={index === scenes.length - 1}
                  >
                    Down
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {generation.reelCaption !== null && (
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Reel caption
            </h3>
            <SectionRegenButton sectionKey="reel.caption" />
          </div>
          <Textarea
            value={reelCaption}
            onChange={(event) => setReelCaption(event.target.value)}
            rows={3}
          />
        </section>
      )}

      {(generation.video?.videoUrl ||
        (generation.video?.shots && generation.video.shots.length > 0)) && (
        <section className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {generation.lengthTier === "promo" ? "Promo video" : "Teaser video"}
            </h3>
            {generation.lengthTier === "teaser" && generation.video ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={regenerateShot.isPending}
                onClick={() => {
                  regenerateShot.mutate(
                    { id: generation.id },
                    {
                      onSuccess: () =>
                        setMessage("Teaser Shot regenerated (−1 credit)"),
                      onError: (err) =>
                        setError(
                          getApiErrorMessage(
                            err,
                            "Could not regenerate Teaser Shot",
                          ),
                        ),
                    },
                  );
                }}
              >
                {regenerateShot.isPending
                  ? "Regenerating…"
                  : "Regenerate Shot (−1 credit)"}
              </Button>
            ) : null}
          </div>
          {generation.video?.videoUrl ? (
            <video
              src={generation.video.videoUrl}
              controls
              className="w-full rounded-lg"
            />
          ) : null}
          {generation.lengthTier === "promo" &&
            generation.video?.shots &&
            generation.video.shots.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Promo stitch — play beat Shots in order (hook → connection).
                </p>
                {generation.video.shots.map((shot) => (
                  <div key={`${shot.beat}-${shot.order}`} className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Shot {shot.order}: {shot.beat.replaceAll("_", " ")} (
                        {shot.status})
                        {!shot.videoUrl && shot.error
                          ? ` — ${shot.error}`
                          : null}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={regenerateShot.isPending}
                        onClick={() => {
                          regenerateShot.mutate(
                            {
                              id: generation.id,
                              data: { beat: shot.beat },
                            },
                            {
                              onSuccess: () =>
                                setMessage(
                                  `Shot “${shot.beat.replaceAll("_", " ")}” regenerated (−1 credit)`,
                                ),
                              onError: (err) =>
                                setError(
                                  getApiErrorMessage(
                                    err,
                                    "Could not regenerate this Shot",
                                  ),
                                ),
                            },
                          );
                        }}
                      >
                        {regenerateShot.isPending
                          ? "Regenerating…"
                          : "Regenerate (−1 credit)"}
                      </Button>
                    </div>
                    {shot.videoUrl ? (
                      <video
                        src={shot.videoUrl}
                        controls
                        className="w-full rounded-lg"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
        </section>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={save}
          disabled={updateGeneration.isPending}
        >
          {updateGeneration.isPending ? "Saving…" : "Save edits"}
        </Button>
        <Button type="button" variant="outline" onClick={onNewGeneration}>
          {newGenerationLabel}
        </Button>
      </div>
    </div>
  );
}
