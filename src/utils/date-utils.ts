
/**
 * Format a date in a user-friendly format
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  if (!date) return '';
  
  try {
    // Check if the date is valid before formatting
    if (isNaN(date.getTime())) {
      return 'Ungültiges Datum';
    }
    
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Ungültiges Datum';
  }
};

/**
 * Safe wrapper for formatDistanceToNow from date-fns
 * Returns a fallback value if the date is invalid
 */
export const formatRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Kürzlich';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Kürzlich';
    }
    
    // Calculate difference in days
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Gestern';
    if (diffDays < 7) return `Vor ${diffDays} Tagen`;
    if (diffDays < 30) return `Vor ${Math.floor(diffDays / 7)} Wochen`;
    return `Vor ${Math.floor(diffDays / 30)} Monaten`;
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'Kürzlich';
  }
};
