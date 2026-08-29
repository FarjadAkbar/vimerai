import type { BlitzTextStyle } from "@/components/studio/blitz-edit-overlay";

export type ComposeBlitzEditInput = {
  videoUrl: string;
  overlayUrl?: string;
  hook: string;
  textStyle: BlitzTextStyle;
};

const COMPOSE_WIDTH = 1080;
const COMPOSE_HEIGHT = 1920;

function isVideoSource(url: string): boolean {
  return (
    !url.startsWith("gradient:") &&
    (url.includes(".mp4") ||
      url.includes("video") ||
      url.startsWith("blob:") ||
      url.endsWith(".webm") ||
      url.endsWith(".mov"))
  );
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image"));
    image.src = url;
  });
}

function loadVideoFrame(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onloadeddata = () => {
      video.currentTime = 0;
    };
    video.onseeked = () => resolve(video);
    video.onerror = () => reject(new Error("Could not load video"));
    video.src = url;
    video.load();
  });
}

function drawHookText(
  ctx: CanvasRenderingContext2D,
  hook: string,
  textStyle: BlitzTextStyle,
) {
  const padding = 48;
  const maxWidth = COMPOSE_WIDTH - padding * 2;
  ctx.font = `bold ${textStyle.fontSize * 2}px ${textStyle.fontFamily}`;
  ctx.fillStyle = textStyle.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(0,0,0,0.75)";
  ctx.shadowBlur = 12;

  const words = hook.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);

  const lineHeight = textStyle.fontSize * 2.4;
  let y = 120;
  for (const line of lines.slice(0, 6)) {
    ctx.fillText(line, COMPOSE_WIDTH / 2, y, maxWidth);
    y += lineHeight;
  }
}

async function drawBaseMedia(
  ctx: CanvasRenderingContext2D,
  videoUrl: string,
): Promise<void> {
  if (isVideoSource(videoUrl)) {
    const video = await loadVideoFrame(videoUrl);
    ctx.drawImage(video, 0, 0, COMPOSE_WIDTH, COMPOSE_HEIGHT);
    return;
  }

  const image = await loadImage(videoUrl);
  ctx.drawImage(image, 0, 0, COMPOSE_WIDTH, COMPOSE_HEIGHT);
}

async function composeToCanvas(
  input: ComposeBlitzEditInput,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = COMPOSE_WIDTH;
  canvas.height = COMPOSE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not supported");
  }

  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, COMPOSE_WIDTH, COMPOSE_HEIGHT);

  await drawBaseMedia(ctx, input.videoUrl);

  if (input.overlayUrl) {
    const overlay = await loadImage(input.overlayUrl);
    const overlayHeight = COMPOSE_HEIGHT * 0.28;
    const overlayWidth = overlay.width * (overlayHeight / overlay.height);
    ctx.drawImage(
      overlay,
      (COMPOSE_WIDTH - overlayWidth) / 2,
      COMPOSE_HEIGHT - overlayHeight - 180,
      overlayWidth,
      overlayHeight,
    );
  }

  drawHookText(ctx, input.hook, input.textStyle);
  return canvas;
}

export async function composeBlitzEditFile(
  input: ComposeBlitzEditInput,
): Promise<File> {
  if (isVideoSource(input.videoUrl) && !input.overlayUrl) {
    try {
      const response = await fetch(input.videoUrl);
      const blob = await response.blob();
      const type = blob.type || "video/mp4";
      return new File([blob], "blitz-compose.mp4", { type });
    } catch {
      /* fall through to canvas compose */
    }
  }

  const canvas = await composeToCanvas(input);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Could not compose image"));
          return;
        }
        resolve(result);
      },
      "image/jpeg",
      0.92,
    );
  });

  return new File([blob], "blitz-compose.jpg", { type: "image/jpeg" });
}
