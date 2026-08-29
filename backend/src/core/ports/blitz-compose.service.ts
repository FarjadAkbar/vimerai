export interface BlitzComposeJobInput {
  brandId: string;
  formatId: string;
  hook: string;
  sourceTemplateId: string | null;
}

export interface ComposeBlitzEditInput {
  brandId: string;
  formatId: string;
  hook: string;
  sourceTemplateId?: string | null;
  file: Buffer;
  contentType: string;
  originalName: string;
}

export interface BlitzComposeResult {
  jobId: string;
  status: string;
  error: string | null;
  contentItemId: string | null;
  mediaKind: 'image' | 'video';
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IBlitzComposeService {
  composeAndSave(
    userId: string,
    input: ComposeBlitzEditInput,
  ): Promise<BlitzComposeResult>;
  getComposeJob(userId: string, jobId: string): Promise<BlitzComposeResult>;
}
