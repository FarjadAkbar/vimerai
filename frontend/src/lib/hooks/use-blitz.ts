"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_BLITZ_CONFIG,
  type BlitzConfig,
  type BlitzMaterial,
} from "@/components/studio/blitz-data";

const CONFIG_KEY = "vimerai.blitz.config";
const MATERIALS_KEY = "vimerai.blitz.materials";
const ACCEPTED_KEY = "vimerai.blitz.accepted";

export function useBlitzConfig() {
  const [config, setConfig] = useState<BlitzConfig>(DEFAULT_BLITZ_CONFIG);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (raw) {
        setConfig({ ...DEFAULT_BLITZ_CONFIG, ...JSON.parse(raw) });
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const save = (next: BlitzConfig) => {
    setConfig(next);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
  };

  return { config, save, ready };
}

export function useBlitzMaterials() {
  const [materials, setMaterials] = useState<BlitzMaterial[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MATERIALS_KEY);
      if (raw) setMaterials(JSON.parse(raw) as BlitzMaterial[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = (next: BlitzMaterial[]) => {
    setMaterials(next);
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(next));
  };

  const add = (material: BlitzMaterial) => {
    persist([material, ...materials]);
  };

  const replaceAll = (next: BlitzMaterial[]) => {
    persist(next);
  };

  return { materials, add, replaceAll, ready };
}

export function useBlitzAccepted() {
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ACCEPTED_KEY);
      if (raw) setAcceptedIds(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const accept = (id: string) => {
    const next = [id, ...acceptedIds.filter((x) => x !== id)];
    setAcceptedIds(next);
    localStorage.setItem(ACCEPTED_KEY, JSON.stringify(next));
  };

  return { acceptedIds, accept };
}
