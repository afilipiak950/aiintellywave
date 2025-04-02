
import * as z from "zod";
import { personaValidationConstraints, validationPatterns } from "@/utils/form-validation";

export const personaCreationSchema = z.object({
  name: z.string()
    .min(
      personaValidationConstraints.name.min, 
      personaValidationConstraints.name.errorMessages.tooShort
    )
    .max(
      personaValidationConstraints.name.max, 
      personaValidationConstraints.name.errorMessages.tooLong
    )
    .refine(
      (val) => !val || validationPatterns.personaName.test(val),
      personaValidationConstraints.name.errorMessages.invalidChars
    ),
  function: z.string()
    .min(1, personaValidationConstraints.function.errorMessages.required),
  style: z.string()
    .min(1, personaValidationConstraints.style.errorMessages.required),
  customStyle: z.string()
    .max(
      personaValidationConstraints.customStyle.max,
      personaValidationConstraints.style.errorMessages.tooLong
    )
    .optional(),
  customFunction: z.string()
    .max(
      personaValidationConstraints.customFunction.max,
      personaValidationConstraints.function.errorMessages.tooLong
    )
    .optional(),
  prompt: z.string()
    .min(
      personaValidationConstraints.prompt.min,
      personaValidationConstraints.prompt.errorMessages.tooShort
    )
    .max(
      personaValidationConstraints.prompt.max,
      personaValidationConstraints.prompt.errorMessages.tooLong
    )
    .optional(),
});

export type PersonaCreationFormValues = z.infer<typeof personaCreationSchema>;
