
-- This migration fixes company associations for fact-talents.de email domains
-- It marks the correct Fact Talents company as primary for these users

-- First, find the Fact Talents company ID
DO $$
DECLARE
  fact_talents_id UUID;
  fact_talents_users RECORD;
BEGIN
  -- Find a company with "Fact Talents" in its name
  SELECT id INTO fact_talents_id
  FROM public.companies
  WHERE lower(name) LIKE '%fact%talent%'
  LIMIT 1;
  
  -- If we don't find a match, look for similar names
  IF fact_talents_id IS NULL THEN
    SELECT id INTO fact_talents_id
    FROM public.companies
    WHERE lower(name) LIKE '%fact%' OR lower(name) LIKE '%talent%'
    LIMIT 1;
  END IF;
  
  -- If we still don't have a match, create the company
  IF fact_talents_id IS NULL THEN
    INSERT INTO public.companies (name, description)
    VALUES ('Fact Talents', 'Automatically created for fact-talents.de users')
    RETURNING id INTO fact_talents_id;
    
    RAISE NOTICE 'Created new Fact Talents company with ID: %', fact_talents_id;
  ELSE
    RAISE NOTICE 'Found existing Fact Talents company with ID: %', fact_talents_id;
  END IF;
  
  -- Update all users with fact-talents.de email to use this company as primary
  FOR fact_talents_users IN
    SELECT DISTINCT user_id, email
    FROM public.company_users
    WHERE lower(email) LIKE '%@fact-talents.de%'
  LOOP
    -- Check if user already has an association with Fact Talents
    IF EXISTS (
      SELECT 1 FROM public.company_users
      WHERE user_id = fact_talents_users.user_id
      AND company_id = fact_talents_id
    ) THEN
      -- Update the existing association to be primary
      UPDATE public.company_users
      SET is_primary_company = TRUE
      WHERE user_id = fact_talents_users.user_id
      AND company_id = fact_talents_id;
      
      -- Make sure other associations for this user are not primary
      UPDATE public.company_users
      SET is_primary_company = FALSE
      WHERE user_id = fact_talents_users.user_id
      AND company_id != fact_talents_id;
      
      RAISE NOTICE 'Updated existing association for user % to Fact Talents', fact_talents_users.user_id;
    ELSE
      -- Create a new association with Fact Talents
      INSERT INTO public.company_users (
        user_id,
        company_id,
        role,
        is_admin,
        email,
        is_primary_company
      )
      VALUES (
        fact_talents_users.user_id,
        fact_talents_id,
        'customer', -- Default role
        FALSE,      -- Not admin by default
        fact_talents_users.email,
        TRUE        -- Mark as primary
      );
      
      -- Make sure other associations for this user are not primary
      UPDATE public.company_users
      SET is_primary_company = FALSE
      WHERE user_id = fact_talents_users.user_id
      AND company_id != fact_talents_id;
      
      RAISE NOTICE 'Created new association for user % to Fact Talents', fact_talents_users.user_id;
    END IF;
  END LOOP;
END $$;
