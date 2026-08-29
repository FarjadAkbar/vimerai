import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  videosApi,
  type SaveBlitzEditPayload,
  type StudioTemplate,
} from '@/lib/api/videos.api';
import {
  BLITZ_FORMATS,
  isBlitzFormatId,
  type BlitzTemplateAsset,
} from '@/components/studio/blitz-data';

export const useVideos = (
  limit = 10,
  offset = 0,
  enabled = true,
  refetchInterval?: number,
) => {
  return useQuery({
    queryKey: ['videos', limit, offset],
    queryFn: () => videosApi.getVideos(limit, offset),
    enabled,
    refetchInterval,
  });
};

export const useVideo = (id: string | null) => {
  return useQuery({
    queryKey: ['video', id],
    queryFn: () => {
      if (!id) throw new Error('Video ID is required');
      return videosApi.getVideo(id);
    },
    enabled: !!id,
  });
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => videosApi.deleteVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
};

export const useDownloadVideo = () => {
  return useMutation({
    mutationFn: (id: string) => videosApi.getDownloadUrl(id),
  });
};

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
    queryKey: ['videos', 'templates'],
    queryFn: () => videosApi.getTemplates(),
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
    queryKey: ['videos', 'viral-remix-templates'],
    queryFn: () => videosApi.getViralRemixTemplates(),
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
    mutationFn: () => videosApi.generateViralRemixSampleTemplates(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['videos', 'viral-remix-templates'],
      });
    },
  });
};

export const useSaveBlitzEdit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveBlitzEditPayload) =>
      videosApi.saveBlitzEdit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
};
