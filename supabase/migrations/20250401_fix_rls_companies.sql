
-- Function to safely get all companies with users for admins
-- This should be run in the SQL editor to fix the recursion issues
CREATE OR REPLACE FUNCTION public.get_all_companies_with_users_admin()
RETURNS SETOF companies
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY 
  SELECT c.* 
  FROM public.companies c;
END;
$$;
