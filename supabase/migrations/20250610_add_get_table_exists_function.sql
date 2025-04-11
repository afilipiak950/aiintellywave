
-- Function to check if a table exists
CREATE OR REPLACE FUNCTION public.get_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = table_name
    AND n.nspname = 'public'
    AND c.relkind = 'r'
  );
END;
$$;
