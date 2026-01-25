// Editor page types

export interface EditorFormState {
  title: string;
  description: string;
  tags: string[];
  newTag: string;
  isSaving: boolean;
}
