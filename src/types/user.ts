
export type User = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  is_active?: boolean;
  avatar_url?: string | null;
  company?: { id: string; name: string } | null;
  company_role?: 'admin' | 'manager' | 'employee' | null;
  roles?: { role: string }[];
};
