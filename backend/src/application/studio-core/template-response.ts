import { Template, TemplateStatus, TemplateType } from '@/domain/template.entity';

export type TemplateResponse = {
  id: string;
  slug: string;
  type: TemplateType;
  contentType: string | null;
  label: string;
  prompt: string;
  videoUrl: string | null;
  previewUrl: string | null;
  durationLabel: string | null;
  remixFormatId: string | null;
  status: TemplateStatus;
  createdAt: string;
  updatedAt: string;
};

export function toTemplateResponse(template: Template): TemplateResponse {
  return {
    id: template.id,
    slug: template.slug,
    type: template.type,
    contentType: template.contentType,
    label: template.label,
    prompt: template.prompt,
    videoUrl: template.videoUrl,
    previewUrl: template.previewUrl,
    durationLabel: template.durationLabel,
    remixFormatId: template.remixFormatId,
    status: template.status,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };
}
