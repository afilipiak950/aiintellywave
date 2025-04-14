
-- Enable Realtime for the company_features table
ALTER TABLE public.company_features REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.company_features;
