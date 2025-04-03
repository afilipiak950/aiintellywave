
-- Optimize company_users and maintain the associated_companies data structure
-- This migration makes sure we handle multiple company users correctly

-- First, ensure we have indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_users_user_id 
ON public.company_users(user_id);

CREATE INDEX IF NOT EXISTS idx_company_users_company_id 
ON public.company_users(company_id);

CREATE INDEX IF NOT EXISTS idx_company_users_email 
ON public.company_users(email);

-- Add a column to track if this is the primary company for a user
-- based on email domain matching
ALTER TABLE public.company_users 
ADD COLUMN IF NOT EXISTS is_primary_company BOOLEAN DEFAULT false;

-- Add a function to determine primary company based on email domain
CREATE OR REPLACE FUNCTION public.set_primary_company_based_on_email()
RETURNS TRIGGER AS $$
DECLARE
  v_email TEXT;
  v_domain TEXT;
  v_domain_prefix TEXT;
  v_company_name TEXT;
  v_best_company_id UUID;
  v_found BOOLEAN := false;
BEGIN
  -- Get the email from the inserted/updated row
  v_email := NEW.email;
  
  -- Only proceed if we have an email
  IF v_email IS NULL OR v_email = '' OR position('@' in v_email) = 0 THEN
    RETURN NEW;
  END IF;
  
  -- Extract the domain and prefix
  v_domain := split_part(v_email, '@', 2);
  v_domain_prefix := split_part(v_domain, '.', 1);
  
  -- First try to find exact match between domain prefix and company name
  SELECT 
    c.id, c.name, true INTO v_best_company_id, v_company_name, v_found
  FROM 
    public.companies c
  WHERE 
    lower(c.name) = lower(v_domain_prefix)
  LIMIT 1;
  
  -- If no exact match, try fuzzy match
  IF NOT v_found THEN
    -- Try where company name contains the domain prefix
    SELECT 
      c.id, c.name, true INTO v_best_company_id, v_company_name, v_found
    FROM 
      public.companies c
    WHERE 
      lower(c.name) LIKE '%' || lower(v_domain_prefix) || '%'
    LIMIT 1;
    
    -- Try where domain prefix contains company name
    IF NOT v_found THEN
      SELECT 
        c.id, c.name, true INTO v_best_company_id, v_company_name, v_found
      FROM 
        public.companies c
      WHERE 
        lower(v_domain_prefix) LIKE '%' || lower(c.name) || '%'
      LIMIT 1;
    END IF;
  END IF;
  
  -- If we found a match, mark this company as primary if it matches
  IF v_found AND v_best_company_id = NEW.company_id THEN
    NEW.is_primary_company := true;
    
    -- Update any other company associations for this user to not be primary
    UPDATE public.company_users
    SET is_primary_company = false
    WHERE 
      user_id = NEW.user_id 
      AND company_id != NEW.company_id
      AND is_primary_company = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to run on insert or update
DROP TRIGGER IF EXISTS set_primary_company_trigger ON public.company_users;
CREATE TRIGGER set_primary_company_trigger
BEFORE INSERT OR UPDATE OF email, company_id ON public.company_users
FOR EACH ROW
EXECUTE FUNCTION public.set_primary_company_based_on_email();

-- Function to populate associated_companies in the application
-- This is for reference, to be used in application code
COMMENT ON FUNCTION public.set_primary_company_based_on_email() IS 
'This function sets is_primary_company=true for the company that best matches 
the user''s email domain. The application should use this to determine which 
company to show as primary for each user.';
