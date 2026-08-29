"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DEFAULT_BLITZ_CONFIG,
  type BlitzConfig,
  type BlitzMaterial,
} from "@/components/studio/blitz-data";
import { brandKitsApi } from "@/lib/api/brand-kits.api";

export function useBlitzConfig(brandId: string | undefined) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["blitz-configuration", brandId],
    queryFn: () => brandKitsApi.getBlitzConfiguration(brandId!),
    enabled: Boolean(brandId),
  });

  const saveMutation = useMutation({
    mutationFn: (next: BlitzConfig) =>
      brandKitsApi.updateBlitzConfiguration(brandId!, next),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["blitz-configuration", brandId],
      });
    },
  });

  const configuration = query.data?.configuration;

  return {
    config: configuration
      ? {
          mentionFrequency: configuration.mentionFrequency,
          showInfluencerMaterials: configuration.showInfluencerMaterials,
          enabledFormats: configuration.enabledFormats,
        }
      : DEFAULT_BLITZ_CONFIG,
    save: saveMutation.mutate,
    saveAsync: saveMutation.mutateAsync,
    ready: !brandId || !query.isLoading,
    isSaving: saveMutation.isPending,
  };
}

const MATERIALS_KEY = "vimerai.blitz.materials";
const ACCEPTED_KEY = "vimerai.blitz.accepted";

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
