
-- Function to safely check if a table exists
CREATE OR REPLACE FUNCTION public.get_table_exists(table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  );
END;
$$;

-- Add proper comments
COMMENT ON FUNCTION public.get_table_exists(TEXT) IS 'Safely checks if a table exists in the public schema';
