import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '@/lib/api/templates.api';
import type { StudioTemplate } from '@/lib/api/templates.api';
import {
  BLITZ_FORMATS,
  isBlitzFormatId,
  type BlitzTemplateAsset,
} from '@/components/studio/blitz-data';

export function mapTemplateToBlitzTemplate(
  template: StudioTemplate,
): BlitzTemplateAsset | null {
  if (!isBlitzFormatId(template.slug)) return null;
  const format = BLITZ_FORMATS.find((entry) => entry.id === template.slug)!;
  return {
    id: template.id,
    formatId: template.slug,
    label: template.label || format.label,
    imageUrl: format.previewImageUrl,
    sourceImageUrl: format.sourceImageUrl,
    videoUrl: template.videoUrl ?? undefined,
    sourceVideoUrl: template.videoUrl ?? undefined,
    prompt: template.prompt,
    createdAt: template.createdAt,
    status: template.status,
  };
}

/** @deprecated Use mapTemplateToBlitzTemplate */
export const mapVideoToBlitzTemplate = mapTemplateToBlitzTemplate;

export const useVideoTemplates = (enabled = true) => {
  return useQuery({
    queryKey: ['templates', 'blitz'],
    queryFn: () => templatesApi.listBlitz(),
    enabled,
    refetchInterval: (query) => {
      const templates = query.state.data?.templates ?? [];
      const pending = templates.some(
        (template) =>
          template.status === 'pending' || template.status === 'processing',
      );
      return pending ? 4000 : false;
    },
  });
};

export const useViralRemixTemplates = (enabled = true) => {
  return useQuery({
    queryKey: ['templates', 'viral-remix'],
    queryFn: () => templatesApi.listViralRemix(),
    enabled,
    refetchInterval: (query) => {
      const templates = query.state.data?.templates ?? [];
      const pending = templates.some(
        (template) =>
          template.status === 'pending' || template.status === 'processing',
      );
      return pending ? 4000 : false;
    },
  });
};

export const useGenerateViralRemixTemplates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => templatesApi.generateViralRemixSamples(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['templates', 'viral-remix'],
      });
    },
  });
};
