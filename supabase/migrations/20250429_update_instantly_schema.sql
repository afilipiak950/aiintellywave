
-- Ensure the schema exists
CREATE SCHEMA IF NOT EXISTS instantly_integration;

-- Update workflows table to ensure it has all the fields we need
DO $$
BEGIN
  -- Create workflows table if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'instantly_integration' AND tablename = 'workflows'
  ) THEN
    CREATE TABLE instantly_integration.workflows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workflow_id TEXT NOT NULL,
      workflow_name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'inactive',
      is_active BOOLEAN DEFAULT false,
      tags TEXT[] DEFAULT '{}',
      raw_data JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  ELSE
    -- Ensure all columns exist
    BEGIN
      ALTER TABLE instantly_integration.workflows ADD COLUMN IF NOT EXISTS workflow_id TEXT;
      ALTER TABLE instantly_integration.workflows ALTER COLUMN workflow_id SET NOT NULL;
      
      ALTER TABLE instantly_integration.workflows ADD COLUMN IF NOT EXISTS workflow_name TEXT;
      ALTER TABLE instantly_integration.workflows ALTER COLUMN workflow_name SET NOT NULL;
      
      ALTER TABLE instantly_integration.workflows ADD COLUMN IF NOT EXISTS description TEXT;
      
      ALTER TABLE instantly_integration.workflows ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'inactive';
      
      ALTER TABLE instantly_integration.workflows ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
      
      ALTER TABLE instantly_integration.workflows ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
      
      ALTER TABLE instantly_integration.workflows ADD COLUMN IF NOT EXISTS raw_data JSONB;
      
      ALTER TABLE instantly_integration.workflows ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
      ALTER TABLE instantly_integration.workflows ALTER COLUMN created_at SET NOT NULL;
      
      ALTER TABLE instantly_integration.workflows ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
      ALTER TABLE instantly_integration.workflows ALTER COLUMN updated_at SET NOT NULL;
    EXCEPTION
      WHEN duplicate_column THEN
        -- Do nothing, column already exists
    END;
  END IF;

  -- Create config table if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'instantly_integration' AND tablename = 'config'
  ) THEN
    CREATE TABLE instantly_integration.config (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      api_key TEXT NOT NULL,
      api_url TEXT DEFAULT 'https://api.instantly.ai/api/v1',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_updated TIMESTAMPTZ
    );
    
    -- Insert default row if needed
    INSERT INTO instantly_integration.config (api_key, api_url)
    SELECT '', 'https://api.instantly.ai/api/v1'
    WHERE NOT EXISTS (SELECT 1 FROM instantly_integration.config LIMIT 1);
  ELSE
    -- Ensure all columns exist
    BEGIN
      ALTER TABLE instantly_integration.config ADD COLUMN IF NOT EXISTS api_key TEXT;
      ALTER TABLE instantly_integration.config ALTER COLUMN api_key SET NOT NULL;
      
      ALTER TABLE instantly_integration.config ADD COLUMN IF NOT EXISTS api_url TEXT DEFAULT 'https://api.instantly.ai/api/v1';
      
      ALTER TABLE instantly_integration.config ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
      ALTER TABLE instantly_integration.config ALTER COLUMN created_at SET NOT NULL;
      
      ALTER TABLE instantly_integration.config ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ;
    EXCEPTION
      WHEN duplicate_column THEN
        -- Do nothing, column already exists
    END;
  END IF;

  -- Create logs table if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'instantly_integration' AND tablename = 'logs'
  ) THEN
    CREATE TABLE instantly_integration.logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
      endpoint TEXT NOT NULL,
      status INTEGER,
      duration_ms INTEGER,
      error_message TEXT,
      request_payload JSONB,
      response_payload JSONB
    );
  ELSE
    -- Ensure all columns exist
    BEGIN
      ALTER TABLE instantly_integration.logs ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ DEFAULT now();
      ALTER TABLE instantly_integration.logs ALTER COLUMN timestamp SET NOT NULL;
      
      ALTER TABLE instantly_integration.logs ADD COLUMN IF NOT EXISTS endpoint TEXT;
      ALTER TABLE instantly_integration.logs ALTER COLUMN endpoint SET NOT NULL;
      
      ALTER TABLE instantly_integration.logs ADD COLUMN IF NOT EXISTS status INTEGER;
      
      ALTER TABLE instantly_integration.logs ADD COLUMN IF NOT EXISTS duration_ms INTEGER;
      
      ALTER TABLE instantly_integration.logs ADD COLUMN IF NOT EXISTS error_message TEXT;
      
      ALTER TABLE instantly_integration.logs ADD COLUMN IF NOT EXISTS request_payload JSONB;
      
      ALTER TABLE instantly_integration.logs ADD COLUMN IF NOT EXISTS response_payload JSONB;
    EXCEPTION
      WHEN duplicate_column THEN
        -- Do nothing, column already exists
    END;
  END IF;
END;
$$;

-- Set up RLS policies
ALTER TABLE instantly_integration.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE instantly_integration.config ENABLE ROW LEVEL SECURITY;
ALTER TABLE instantly_integration.logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users can do all operations on workflows" ON instantly_integration.workflows;
DROP POLICY IF EXISTS "Admin users can do all operations on config" ON instantly_integration.config;
DROP POLICY IF EXISTS "Admin users can do all operations on logs" ON instantly_integration.logs;

-- Create policies for admin access
CREATE POLICY "Admin users can do all operations on workflows" 
  ON instantly_integration.workflows
  USING (public.is_admin_user());

CREATE POLICY "Admin users can do all operations on config" 
  ON instantly_integration.config
  USING (public.is_admin_user());
  
CREATE POLICY "Admin users can do all operations on logs" 
  ON instantly_integration.logs
  USING (public.is_admin_user());
