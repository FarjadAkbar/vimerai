"use client";

import { useEffect, useState } from "react";
import type { Influencer } from "@/components/studio/influencer-data";

const STORAGE_KEY = "vimerai.influencers";

export function useInfluencers() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setInfluencers(JSON.parse(raw) as Influencer[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = (next: Influencer[]) => {
    setInfluencers(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const add = (influencer: Influencer) => {
    persist([influencer, ...influencers]);
  };

  const remove = (id: string) => {
    persist(influencers.filter((entry) => entry.id !== id));
  };

  return { influencers, add, remove, ready };
}
