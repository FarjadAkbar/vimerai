export const FORMAT_MODALITIES = ['post', 'video', 'both'] as const;
export type FormatModality = (typeof FORMAT_MODALITIES)[number];

export const FORMAT_LIST_MODES = ['post', 'video'] as const;
export type FormatListMode = (typeof FORMAT_LIST_MODES)[number];

export interface Format {
  id: string;
  label: string;
  description: string;
  modality: FormatModality;
  /** Prompt / structure payload used by Post Job and Video Job services. */
  promptStructure: string;
}

export function isFormatListMode(value: string): value is FormatListMode {
  return (FORMAT_LIST_MODES as readonly string[]).includes(value);
}
