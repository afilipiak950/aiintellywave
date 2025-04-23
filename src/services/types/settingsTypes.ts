
// This file contains type definitions for the Settings section of the application

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
  related_to?: string;
  is_read: boolean;
  read_at?: string | null; // Added this field to match the database schema
}
