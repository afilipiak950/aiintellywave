
// This file contains type definitions for the Settings section of the application

// User settings type
export interface UserSettings {
  id?: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  email_notifications: boolean;
  push_notifications: boolean;
  display_name?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

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
  read_at?: string | null; // Adding this field to match what's used in the code
}
