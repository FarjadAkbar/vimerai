"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Shows the video's first frame; plays only while hovered/focused. */
export function BlitzHoverVideo({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const play = () => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play().catch(() => undefined);
  };

  const pause = () => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  };

  return (
    <video
      ref={videoRef}
      className={cn("bg-neutral-900 object-cover", className)}
      src={src}
      muted
      loop
      playsInline
      preload="auto"
      onMouseEnter={play}
      onMouseLeave={pause}
      onFocus={play}
      onBlur={pause}
    />
  );
}
