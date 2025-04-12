
-- Create a function to check if a user exists in auth.users
CREATE OR REPLACE FUNCTION public.check_user_exists(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id_param
  );
END;
$$;
