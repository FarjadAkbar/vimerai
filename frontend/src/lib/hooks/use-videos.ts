import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { videosApi } from '@/lib/api/videos.api';

export const useVideos = (limit = 10, offset = 0, enabled = true, refetchInterval?: number) => {
  return useQuery({
    queryKey: ['videos', limit, offset],
    queryFn: () => videosApi.getVideos(limit, offset),
    enabled, // Allow disabling the query to prevent API calls when not authenticated
    refetchInterval: refetchInterval, // Optional refetch interval for polling
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

