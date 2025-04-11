
-- Create table for campaign company assignments if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.campaign_company_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  company_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(campaign_id, company_id)
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_campaign_company_campaign_id ON public.campaign_company_assignments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_company_company_id ON public.campaign_company_assignments(company_id);

-- Ensure row level security is enabled
ALTER TABLE public.campaign_company_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Admins can manage all campaign company assignments"
  ON public.campaign_company_assignments
  USING (public.is_admin_user_safe());

-- Create a function to assign companies to campaigns
CREATE OR REPLACE FUNCTION public.assign_companies_to_campaign(
  campaign_id_param TEXT,
  company_ids UUID[]
)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  company_id UUID;
  inserted_id UUID;
BEGIN
  -- Clear existing assignments for this campaign
  DELETE FROM public.campaign_company_assignments
  WHERE campaign_id = campaign_id_param;
  
  -- Insert new assignments
  FOREACH company_id IN ARRAY company_ids
  LOOP
    INSERT INTO public.campaign_company_assignments(campaign_id, company_id, created_by)
    VALUES (campaign_id_param, company_id, auth.uid())
    RETURNING id INTO inserted_id;
    
    RETURN NEXT inserted_id;
  END LOOP;
  
  RETURN;
END;
$$;
