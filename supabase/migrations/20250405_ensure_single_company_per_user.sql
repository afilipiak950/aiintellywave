
-- Create a function that can be run to ensure each user has only one company association
CREATE OR REPLACE FUNCTION public.ensure_single_company_per_user()
RETURNS TABLE(user_id uuid, previous_company_count bigint, current_company_count bigint)
LANGUAGE plpgsql
AS $$
DECLARE
  user_record RECORD;
  company_to_keep uuid;
BEGIN
  -- Create temp table for results
  CREATE TEMP TABLE cleanup_results(
    user_id uuid,
    previous_company_count bigint,
    current_company_count bigint
  );
  
  -- Find users with multiple company associations
  FOR user_record IN 
    SELECT cu.user_id, COUNT(cu.company_id) as company_count
    FROM public.company_users cu
    GROUP BY cu.user_id
    HAVING COUNT(cu.company_id) > 1
  LOOP
    -- Identify which company to keep (prioritize role = 'manager' or most recent)
    SELECT company_id INTO company_to_keep
    FROM public.company_users
    WHERE user_id = user_record.user_id
    ORDER BY 
      CASE 
        WHEN role = 'manager' THEN 0
        WHEN role = 'admin' THEN 1
        ELSE 2
      END,
      created_at DESC
    LIMIT 1;
    
    -- Record the previous count
    INSERT INTO cleanup_results VALUES (
      user_record.user_id, 
      user_record.company_count,
      0
    );
    
    -- Delete all other associations
    DELETE FROM public.company_users
    WHERE user_id = user_record.user_id
    AND company_id != company_to_keep;
    
    -- Update the count after cleanup
    UPDATE cleanup_results
    SET current_company_count = (
      SELECT COUNT(*)
      FROM public.company_users
      WHERE user_id = user_record.user_id
    )
    WHERE user_id = user_record.user_id;
  END LOOP;
  
  -- Return the results
  RETURN QUERY SELECT * FROM cleanup_results;
END;
$$;

-- Run the cleanup function to fix existing data
SELECT * FROM public.ensure_single_company_per_user();

-- Add a unique constraint on user_id to prevent future multiple associations
-- First check if constraint already exists to avoid error
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'company_users_user_id_key'
  ) THEN
    ALTER TABLE public.company_users ADD CONSTRAINT company_users_user_id_key UNIQUE (user_id);
    RAISE NOTICE 'Added unique constraint on user_id in company_users table';
  ELSE
    RAISE NOTICE 'Unique constraint on user_id already exists';
  END IF;
END $$;
