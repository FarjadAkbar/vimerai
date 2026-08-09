import { useQuery } from '@tanstack/react-query';
import { formatsApi } from '@/lib/api/formats.api';
import type { FormatListMode } from '@/lib/api/formats.api';

export const useFormats = (modality: FormatListMode, enabled = true) => {
  return useQuery({
    queryKey: ['formats', modality],
    queryFn: () => formatsApi.list(modality),
    enabled,
  });
};
