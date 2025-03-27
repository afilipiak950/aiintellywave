
export interface AIPersona {
  id: string;
  user_id: string;
  name: string;
  function: string;
  style: string;
  prompt: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailIntegration {
  id: string;
  user_id: string;
  provider: 'gmail' | 'outlook' | 'linkedin' | 'other';
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailContact {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  company?: string;
  position?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailMessage {
  id: string;
  user_id: string;
  subject?: string;
  body: string;
  sender?: string;
  recipient?: string;
  received_date?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailAnalysis {
  id: string;
  email_id: string;
  tone_analysis?: Record<string, any>;
  style_metrics?: Record<string, any>;
  persona_match?: Record<string, any>;
  summary?: string;
  created_at: string;
  updated_at: string;
}

export type StyleOption = {
  id: string;
  name: string;
  description: string;
  tone: string;
  icon?: string;
};

export type PersonaFunction = {
  id: string;
  name: string;
  description: string;
  icon?: string;
};
