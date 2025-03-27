
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
