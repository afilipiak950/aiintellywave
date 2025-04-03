
-- Function to check company user associations for a specific user
CREATE OR REPLACE FUNCTION public.check_user_company_associations(user_id_param UUID)
RETURNS TABLE (
  company_id UUID,
  company_name TEXT,
  role TEXT,
  is_admin BOOLEAN,
  email TEXT,
  is_manager_kpi_enabled BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    cu.company_id,
    c.name as company_name,
    cu.role,
    cu.is_admin,
    cu.email,
    cu.is_manager_kpi_enabled
  FROM 
    public.company_users cu
    JOIN public.companies c ON cu.company_id = c.id
  WHERE 
    cu.user_id = user_id_param;
END;
$$;

-- Add index to company_users for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON public.company_users (user_id);
