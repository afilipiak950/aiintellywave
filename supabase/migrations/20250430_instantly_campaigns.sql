
-- Create campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS instantly_integration.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT array[]::TEXT[],
  statistics JSONB DEFAULT '{}'::JSONB,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create a function to get campaigns with pagination, search, and sorting
CREATE OR REPLACE FUNCTION public.get_instantly_campaigns(
  search_term TEXT DEFAULT NULL,
  sort_field TEXT DEFAULT 'updated_at',
  sort_direction TEXT DEFAULT 'desc',
  page_from INT DEFAULT 0,
  page_to INT DEFAULT 24
)
RETURNS TABLE (
  id UUID,
  campaign_id TEXT,
  name TEXT,
  description TEXT,
  status TEXT,
  is_active BOOLEAN,
  tags TEXT[],
  statistics JSONB,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  raw_data JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  count_val BIGINT;
  query_text TEXT;
  where_clause TEXT := '';
  order_clause TEXT;
BEGIN
  -- Build where clause for search
  IF search_term IS NOT NULL THEN
    where_clause := format(' WHERE name ILIKE %L OR description ILIKE %L', 
                          search_term, search_term);
  END IF;
  
  -- Build order clause based on parameters
  IF sort_direction = 'asc' THEN
    order_clause := format(' ORDER BY %I ASC', sort_field);
  ELSE
    order_clause := format(' ORDER BY %I DESC', sort_field);
  END IF;
  
  -- Get count first
  EXECUTE 'SELECT COUNT(*) FROM instantly_integration.campaigns' || where_clause INTO count_val;
  
  -- Return results with count
  RETURN QUERY EXECUTE format('
    SELECT 
      c.id,
      c.campaign_id,
      c.name,
      c.description,
      c.status,
      c.is_active,
      c.tags,
      c.statistics,
      c.start_date,
      c.end_date,
      c.raw_data,
      c.created_at,
      c.updated_at,
      %s::bigint as count
    FROM instantly_integration.campaigns c
    %s
    %s
    LIMIT %s OFFSET %s',
    count_val,
    where_clause,
    order_clause,
    (page_to - page_from + 1),
    page_from
  );
END;
$$;
