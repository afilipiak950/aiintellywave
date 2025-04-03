
-- Add unique constraint to ensure only one user-company pair can exist
-- Note: This could fail if duplicates already exist, so we first need to check
-- and potentially remove duplicates
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    -- Count any potential duplicates
    SELECT COUNT(*) INTO duplicate_count 
    FROM (
        SELECT user_id, company_id, COUNT(*)
        FROM public.company_users
        GROUP BY user_id, company_id
        HAVING COUNT(*) > 1
    ) as duplicates;
    
    -- If duplicates exist, raise a notice but don't delete automatically
    -- as that would need manual review in a production environment
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Found % duplicate user-company pairs in company_users table.', duplicate_count;
        RAISE NOTICE 'Please run the migration_to_single_company_per_user() function to automatically clean duplicates.';
    END IF;
END $$;

-- If not exists, add a unique constraint to prevent future duplicates
DO $$
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'unique_user_company_association'
    ) THEN
        -- Create the constraint
        ALTER TABLE public.company_users 
        ADD CONSTRAINT unique_user_company_association 
        UNIQUE (user_id, company_id);
        
        RAISE NOTICE 'Added unique constraint on user_id and company_id in company_users table.';
    ELSE
        RAISE NOTICE 'Unique constraint already exists on user_id and company_id.';
    END IF;
END $$;

-- Create index on company_users for better performance on user_id lookups if not exists
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON public.company_users (user_id);
