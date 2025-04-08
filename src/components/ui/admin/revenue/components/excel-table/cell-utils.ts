
/**
 * Utility functions for cell formatting and display
 */

/**
 * Formats a value as currency (EUR)
 * @param value The value to format
 * @returns Formatted currency string
 */
export const formatCurrencyValue = (value: string | number): string => {
  if (isNaN(Number(value)) || value === '') {
    return value.toString();
  }
  
  try {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value));
  } catch (error) {
    return value.toString();
  }
};

/**
 * Determines if a value is numeric
 * @param value The value to check
 * @returns True if the value is numeric
 */
export const isNumericValue = (value: string | number): boolean => {
  return !isNaN(Number(value)) && value !== '';
};
