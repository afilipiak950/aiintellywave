
-- Create the campaign_company_assignments table
CREATE TABLE IF NOT EXISTS public.campaign_company_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(campaign_id, company_id)
);

-- Add comment to table
COMMENT ON TABLE public.campaign_company_assignments IS 
  'Stores the relationship between campaigns and the companies they are assigned to';

-- Add RLS policies
ALTER TABLE public.campaign_company_assignments ENABLE ROW LEVEL SECURITY;

-- Allow users to select from the table
CREATE POLICY "Users can view campaign assignments" 
  ON public.campaign_company_assignments 
  FOR SELECT 
  USING (true);

-- Only admin users can insert/update/delete campaigns
CREATE POLICY "Admins can manage campaign assignments" 
  ON public.campaign_company_assignments 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_company_assignments_campaign_id 
  ON public.campaign_company_assignments(campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_company_assignments_company_id 
  ON public.campaign_company_assignments(company_id);
