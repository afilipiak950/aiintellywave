
export type SuggestionItem = {
  id: string;
  title: string;
  type: 'lead' | 'project' | 'campaign' | 'appointment' | 'document' | 'other';
  path: string;
  description?: string;
  relevance?: number;
};

export type SuggestionGroup = {
  type: string;
  label: string;
  items: SuggestionItem[];
};
