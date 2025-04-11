
-- Create a function to check if a user exists across tables
CREATE OR REPLACE FUNCTION public.check_user_exists(lookup_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Try to find the user in auth.users first
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = lookup_user_id
  ) INTO user_exists;
  
  -- Return early if found
  IF user_exists THEN
    RETURN TRUE;
  END IF;
  
  -- Try to find the user in profiles
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = lookup_user_id
  ) INTO user_exists;
  
  -- Return early if found
  IF user_exists THEN
    RETURN TRUE;
  END IF;
  
  -- Try to find the user in company_users
  SELECT EXISTS (
    SELECT 1 FROM public.company_users WHERE user_id = lookup_user_id
  ) INTO user_exists;
  
  -- Return early if found
  IF user_exists THEN
    RETURN TRUE;
  END IF;
  
  -- Try to find the user in user_roles
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = lookup_user_id
  ) INTO user_exists;
  
  RETURN user_exists;
END;
$$;
