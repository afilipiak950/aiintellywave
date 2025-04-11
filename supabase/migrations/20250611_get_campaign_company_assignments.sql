
-- Create function to get campaign company assignments
CREATE OR REPLACE FUNCTION public.get_campaign_company_assignments(campaign_id_param TEXT)
RETURNS TABLE (company_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.company_id
  FROM 
    public.campaign_company_assignments a
  WHERE 
    a.campaign_id = campaign_id_param;
END;
$$;
