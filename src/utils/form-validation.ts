
/**
 * General validation utility functions for forms
 */

/**
 * Validates if a string is within min and max length
 */
export const validateLength = (value: string, min: number, max: number): boolean => {
  if (!value) return false;
  return value.length >= min && value.length <= max;
};

/**
 * Validates if a string contains only allowed characters
 */
export const validateCharacters = (value: string, pattern: RegExp): boolean => {
  if (!value) return false;
  return pattern.test(value);
};

/**
 * Formats error messages for field validation failures
 */
export const formatValidationError = (fieldName: string, reason: string): string => {
  return `${fieldName} ${reason}`;
};

/**
 * Common validation patterns
 */
export const validationPatterns = {
  // Allow letters, numbers, spaces and common punctuation
  personaName: /^[\p{L}\p{N}\s.,!?'"-]+$/u,
  // Less strict HTML check - only looking for actual HTML tag structures
  noHtml: /^(?!.*<\/?[a-z][\s\S]*?>).*$/i,
};

/**
 * Validation constraints for persona form
 */
export const personaValidationConstraints = {
  name: {
    min: 2,
    max: 50,
    errorMessages: {
      required: "Name is required",
      tooShort: "must be at least 2 characters",
      tooLong: "must be less than 50 characters",
      invalidChars: "contains invalid characters"
    }
  },
  style: {
    min: 1,
    max: 100,
    errorMessages: {
      required: "Style is required",
      tooLong: "is too long (maximum 100 characters)"
    }
  },
  function: {
    min: 1,
    max: 100,
    errorMessages: {
      required: "Function is required",
      tooLong: "is too long (maximum 100 characters)"
    }
  },
  prompt: {
    min: 10,
    max: 2000,
    errorMessages: {
      required: "Prompt is required",
      tooShort: "must be at least 10 characters",
      tooLong: "is too long (maximum 2000 characters)"
    }
  },
  customStyle: {
    min: 2,
    max: 100,
  },
  customFunction: {
    min: 2,
    max: 100,
  }
};
