
// Basic Campaign type definition
export interface Campaign {
  id: string;
  name: string;
  status: number | string;
  created_at?: string;
  updated_at?: string;
  daily_limit?: number;
  stop_on_reply?: boolean;
  stop_on_auto_reply?: boolean;
  date?: string;
  tags?: string[];
  statistics?: {
    emailsSent?: number;
    replies?: number;
    opens?: number;
    bounces?: number;
    openRate?: number;
  };
}
