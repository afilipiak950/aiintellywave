
import * as z from 'zod';

// Persona creation form schema
export const personaCreationSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  function: z.string().min(1, { message: 'Please select a function.' }),
  style: z.string().min(1, { message: 'Please select a style.' }),
});

export type PersonaCreationFormValues = z.infer<typeof personaCreationSchema>;
