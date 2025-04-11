
export interface Campaign {
  id: string;
  name: string;
  status?: string | number;
  description?: string;
  daily_limit?: number;
  dailyLimit?: number;
  stop_on_reply?: boolean;
  stop_on_auto_reply?: boolean;
  created_at?: string;
  updated_at?: string;
  date?: string;
  statistics?: {
    emailsSent?: number;
    replies?: number;
    opens?: number;
    bounces?: number;
    openRate?: number;
  };
  recipients?: string[];
}
