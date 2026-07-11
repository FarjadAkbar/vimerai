"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateGeneration } from "@/lib/hooks/use-generations";
import {
  getApiErrorMessage,
  type GenerationRecord,
  type ManualEditStoryboardSceneRequest,
} from "@/lib/api/generations.api";

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
}: {
  generation: GenerationRecord;
  onNewGeneration: () => void;
}) {
  const updateGeneration = useUpdateGeneration();
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
    setMessage(null);
    setError(null);
  }, [generation]);

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
            {generation.status} · Manual edits are free
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
          <div className="space-y-1.5">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cta">CTA</Label>
            <Input
              id="cta"
              value={cta}
              onChange={(event) => setCta(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hashtags">Hashtags</Label>
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
            <Label htmlFor="hook">Hook</Label>
            <Textarea
              id="hook"
              value={hook}
              onChange={(event) => setHook(event.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="attention">Attention</Label>
            <Textarea
              id="attention"
              value={attention}
              onChange={(event) => setAttention(event.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="productDisplay">Product display</Label>
            <Textarea
              id="productDisplay"
              value={productDisplay}
              onChange={(event) => setProductDisplay(event.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="viewerConnection">Viewer connection</Label>
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
                <div className="flex gap-2">
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
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Reel caption
          </h3>
          <Textarea
            value={reelCaption}
            onChange={(event) => setReelCaption(event.target.value)}
            rows={3}
          />
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
          New Generation
        </Button>
      </div>
    </div>
  );
}
