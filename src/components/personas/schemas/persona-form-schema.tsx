
import * as z from "zod";

export const personaCreationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  function: z.string().min(1, "Function is required"),
  style: z.string().min(1, "Style is required"),
  prompt: z.string().optional(),
});

export type PersonaCreationFormValues = z.infer<typeof personaCreationSchema>;
