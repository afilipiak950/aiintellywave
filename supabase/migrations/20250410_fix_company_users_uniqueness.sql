
-- This migration ensures each user has exactly one company association
-- and adds a unique constraint to enforce this requirement

-- First, log any users with multiple company associations
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT user_id)
    INTO user_count
    FROM (
        SELECT user_id, COUNT(*) 
        FROM public.company_users 
        GROUP BY user_id
        HAVING COUNT(*) > 1
    ) as dupes;
    
    RAISE NOTICE 'Found % users with multiple company associations', user_count;
END $$;

-- Create an index on company_users.user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'company_users' 
        AND indexname = 'idx_company_users_user_id'
    ) THEN
        CREATE INDEX idx_company_users_user_id ON public.company_users(user_id);
        RAISE NOTICE 'Created index on company_users.user_id';
    ELSE
        RAISE NOTICE 'Index on company_users.user_id already exists';
    END IF;
END $$;

-- Add a function to identify users with multiple companies and keep only the best one
CREATE OR REPLACE FUNCTION public.ensure_single_company_per_user()
RETURNS TABLE(user_id uuid, previous_count bigint, current_count bigint, kept_company_id uuid) 
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
    company_to_keep uuid;
BEGIN
    -- Create temporary table to track changes
    CREATE TEMP TABLE temp_results (
        user_id uuid,
        previous_count bigint,
        current_count bigint,
        kept_company_id uuid
    );
    
    -- Process each user with multiple companies
    FOR rec IN 
        SELECT cu.user_id, COUNT(*) as count
        FROM public.company_users cu
        GROUP BY cu.user_id
        HAVING COUNT(*) > 1
    LOOP
        -- First try to find the primary company based on role and KPI settings
        SELECT company_id INTO company_to_keep
        FROM public.company_users
        WHERE user_id = rec.user_id
        ORDER BY 
            -- Prioritize entries with manager role AND kpi enabled
            CASE WHEN role = 'manager' AND is_manager_kpi_enabled = true THEN 1
                 -- Then prioritize entries with manager role
                 WHEN role = 'manager' THEN 2
                 -- Then prioritize entries with kpi enabled
                 WHEN is_manager_kpi_enabled = true THEN 3
                 -- Then prioritize admin roles
                 WHEN role = 'admin' OR is_admin = true THEN 4
                 -- Then prioritize by customer and other roles
                 ELSE 10
            END,
            -- Finally sort by creation date (keep newer)
            created_at DESC
        LIMIT 1;
        
        -- Save the result for tracking
        INSERT INTO temp_results VALUES(
            rec.user_id,
            rec.count,
            0, -- Will be updated after the delete
            company_to_keep
        );
        
        -- Delete all other company associations
        DELETE FROM public.company_users
        WHERE user_id = rec.user_id
          AND company_id != company_to_keep;
        
        -- Update the current count
        UPDATE temp_results
        SET current_count = (
            SELECT COUNT(*) 
            FROM public.company_users 
            WHERE user_id = rec.user_id
        )
        WHERE user_id = rec.user_id;
        
        RAISE NOTICE 'User % now has exactly one company: %', rec.user_id, company_to_keep;
    END LOOP;
    
    -- Return the results
    RETURN QUERY SELECT * FROM temp_results;
END;
$$;

-- Run the function to clean up any existing duplicate associations
SELECT * FROM public.ensure_single_company_per_user();

-- Now add a unique constraint on user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'company_users_user_id_key'
    ) THEN
        ALTER TABLE public.company_users ADD CONSTRAINT company_users_user_id_key UNIQUE (user_id);
        RAISE NOTICE 'Added unique constraint on user_id in company_users table';
    ELSE
        RAISE NOTICE 'Unique constraint on user_id already exists';
    END IF;
END $$;

-- Add a note that will be visible in the logs when the migration runs
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: Each user now has exactly one company association';
    RAISE NOTICE 'Company-User relationships are now enforced with a unique constraint';
END $$;
