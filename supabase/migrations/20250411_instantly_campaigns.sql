
-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS instantly_integration;

-- Create campaigns table for storing campaign data including tags
CREATE TABLE IF NOT EXISTS instantly_integration.campaigns (
  id UUID PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  statistics JSONB,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE instantly_integration.campaigns ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to select campaigns
CREATE POLICY "Allow authenticated users to select campaigns" 
  ON instantly_integration.campaigns
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow all authenticated users to insert campaigns
CREATE POLICY "Allow authenticated users to insert campaigns" 
  ON instantly_integration.campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow all authenticated users to update campaigns
CREATE POLICY "Allow authenticated users to update campaigns" 
  ON instantly_integration.campaigns
  FOR UPDATE
  TO authenticated
  USING (true);
