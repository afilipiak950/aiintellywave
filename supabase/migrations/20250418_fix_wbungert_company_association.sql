
-- This migration ensures all wbungert.com emails are associated with the Bungert company
-- Also ensures teso-specialist.de emails are associated with the Teso Specialist company

DO $$
DECLARE
  bungert_id UUID;
  teso_specialist_id UUID;
  bungert_users RECORD;
  teso_users RECORD;
BEGIN
  -- First, find the Bungert company ID
  SELECT id INTO bungert_id
  FROM public.companies
  WHERE lower(name) LIKE '%bungert%'
  LIMIT 1;
  
  -- If no Bungert company exists, create one
  IF bungert_id IS NULL THEN
    INSERT INTO public.companies (name, description)
    VALUES ('Bungert', 'Company for wbungert.com domain users')
    RETURNING id INTO bungert_id;
    
    RAISE NOTICE 'Created new Bungert company with ID: %', bungert_id;
  ELSE
    RAISE NOTICE 'Found existing Bungert company with ID: %', bungert_id;
  END IF;
  
  -- Now find or create the Teso Specialist company ID
  SELECT id INTO teso_specialist_id
  FROM public.companies
  WHERE lower(name) LIKE '%teso%specialist%'
  LIMIT 1;
  
  -- If no Teso Specialist company exists, create one
  IF teso_specialist_id IS NULL THEN
    INSERT INTO public.companies (name, description)
    VALUES ('Teso Specialist', 'Company for teso-specialist.de domain users')
    RETURNING id INTO teso_specialist_id;
    
    RAISE NOTICE 'Created new Teso Specialist company with ID: %', teso_specialist_id;
  ELSE
    RAISE NOTICE 'Found existing Teso Specialist company with ID: %', teso_specialist_id;
  END IF;
  
  -- Get all users with wbungert.com email domains
  FOR bungert_users IN
    SELECT DISTINCT user_id, email
    FROM public.company_users
    WHERE lower(email) LIKE '%@wbungert.com%'
  LOOP
    -- Check if this user already has an association with Bungert company
    IF EXISTS (
      SELECT 1 FROM public.company_users
      WHERE user_id = bungert_users.user_id
      AND company_id = bungert_id
    ) THEN
      -- If yes, update the is_primary_company flag
      UPDATE public.company_users
      SET is_primary_company = TRUE
      WHERE user_id = bungert_users.user_id
      AND company_id = bungert_id;
      
      -- Set all other company associations for this user to non-primary
      UPDATE public.company_users
      SET is_primary_company = FALSE
      WHERE user_id = bungert_users.user_id
      AND company_id != bungert_id;
      
      RAISE NOTICE 'Updated existing Bungert association for user %', bungert_users.user_id;
    ELSE
      -- If no, create a new association with Bungert
      INSERT INTO public.company_users (
        user_id,
        company_id,
        role,
        is_admin,
        email,
        is_primary_company
      )
      VALUES (
        bungert_users.user_id,
        bungert_id,
        'customer', -- Default role
        FALSE,      -- Not an admin by default
        bungert_users.email,
        TRUE        -- Set as primary company
      );
      
      -- Set all other company associations for this user to non-primary
      UPDATE public.company_users
      SET is_primary_company = FALSE
      WHERE user_id = bungert_users.user_id
      AND company_id != bungert_id;
      
      RAISE NOTICE 'Created new Bungert association for user %', bungert_users.user_id;
    END IF;
  END LOOP;
  
  -- Get all users with teso-specialist.de email domains
  FOR teso_users IN
    SELECT DISTINCT user_id, email
    FROM public.company_users
    WHERE lower(email) LIKE '%@teso-specialist.de%'
  LOOP
    -- Check if this user already has an association with Teso Specialist company
    IF EXISTS (
      SELECT 1 FROM public.company_users
      WHERE user_id = teso_users.user_id
      AND company_id = teso_specialist_id
    ) THEN
      -- If yes, update the is_primary_company flag
      UPDATE public.company_users
      SET is_primary_company = TRUE
      WHERE user_id = teso_users.user_id
      AND company_id = teso_specialist_id;
      
      -- Set all other company associations for this user to non-primary
      UPDATE public.company_users
      SET is_primary_company = FALSE
      WHERE user_id = teso_users.user_id
      AND company_id != teso_specialist_id;
      
      RAISE NOTICE 'Updated existing Teso Specialist association for user %', teso_users.user_id;
    ELSE
      -- If no, create a new association with Teso Specialist
      INSERT INTO public.company_users (
        user_id,
        company_id,
        role,
        is_admin,
        email,
        is_primary_company
      )
      VALUES (
        teso_users.user_id,
        teso_specialist_id,
        'customer', -- Default role
        FALSE,      -- Not an admin by default
        teso_users.email,
        TRUE        -- Set as primary company
      );
      
      -- Set all other company associations for this user to non-primary
      UPDATE public.company_users
      SET is_primary_company = FALSE
      WHERE user_id = teso_users.user_id
      AND company_id != teso_specialist_id;
      
      RAISE NOTICE 'Created new Teso Specialist association for user %', teso_users.user_id;
    END IF;
  END LOOP;
END $$;
