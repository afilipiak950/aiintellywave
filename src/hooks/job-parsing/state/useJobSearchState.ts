
import { z } from 'zod';

// Define the schema for search parameters
export const searchParamsSchema = z.object({
  query: z.string().min(1, "Suchbegriff ist erforderlich"),
  location: z.string().optional(),
  experience: z.enum(['any', 'entry_level', 'mid_level', 'senior_level']).default('any'),
  industry: z.string().optional(),
  maxResults: z.number().min(1).max(100).default(50) // Change default to 50
});

// Export the type for use in components
export type SearchParams = z.infer<typeof searchParamsSchema>;

// Initial search parameters
export const initialSearchParams: SearchParams = {
  query: '',
  location: '',
  experience: 'any',
  industry: '',
  maxResults: 50 // Change to 50
};
