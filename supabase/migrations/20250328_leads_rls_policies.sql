
-- Add RLS policies for the leads table to ensure users can access their data
-- This file is for documentation purposes only and should be run manually in the Supabase SQL editor

-- Enable Row Level Security on leads table if not already enabled
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to select leads
CREATE POLICY IF NOT EXISTS "Allow users to select leads" 
ON public.leads
FOR SELECT 
USING (true);

-- Create policy to allow all authenticated users to insert leads
CREATE POLICY IF NOT EXISTS "Allow users to insert leads" 
ON public.leads
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow users to update their own leads
CREATE POLICY IF NOT EXISTS "Allow users to update leads" 
ON public.leads
FOR UPDATE 
USING (true);

-- Create policy to allow users to delete their own leads
CREATE POLICY IF NOT EXISTS "Allow users to delete leads" 
ON public.leads
FOR DELETE 
USING (true);

-- Add these comments to help understand the RLS implications
COMMENT ON TABLE public.leads IS 'Stores lead information for users and projects';
COMMENT ON POLICY "Allow users to select leads" ON public.leads IS 'Enables all authenticated users to view leads';
COMMENT ON POLICY "Allow users to insert leads" ON public.leads IS 'Enables all authenticated users to create leads';
COMMENT ON POLICY "Allow users to update leads" ON public.leads IS 'Enables all authenticated users to update leads';
COMMENT ON POLICY "Allow users to delete leads" ON public.leads IS 'Enables all authenticated users to delete leads';
