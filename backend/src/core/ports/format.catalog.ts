import type { Format, FormatListMode } from '@/types/format/format';

export interface IFormatCatalog {
  listByModality(mode: FormatListMode): Format[];
  getById(id: string): Format | null;
}
