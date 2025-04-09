
-- Create helper functions to query the instantly_integration schema

-- Function to get workflows with search, sort, and pagination
CREATE OR REPLACE FUNCTION public.get_instantly_workflows(
  search_term TEXT DEFAULT NULL,
  sort_field TEXT DEFAULT 'updated_at',
  sort_direction TEXT DEFAULT 'desc',
  page_from INT DEFAULT 0,
  page_to INT DEFAULT 24
)
RETURNS TABLE (
  id UUID,
  workflow_id TEXT,
  workflow_name TEXT,
  description TEXT,
  status TEXT,
  is_active BOOLEAN,
  tags TEXT[],
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
    where_clause := format(' WHERE workflow_name ILIKE %L OR description ILIKE %L', 
                          search_term, search_term);
  END IF;
  
  -- Build order clause based on parameters
  IF sort_direction = 'asc' THEN
    order_clause := format(' ORDER BY %I ASC', sort_field);
  ELSE
    order_clause := format(' ORDER BY %I DESC', sort_field);
  END IF;
  
  -- Get count first
  query_text := 'SELECT COUNT(*) FROM instantly_integration.workflows' || where_clause;
  EXECUTE query_text INTO count_val;
  
  -- Build and execute the main query
  query_text := 'SELECT *, ' || count_val || ' AS count FROM instantly_integration.workflows' 
              || where_clause 
              || order_clause
              || ' LIMIT ' || (page_to - page_from + 1) || ' OFFSET ' || page_from;
  
  RETURN QUERY EXECUTE query_text;
END;
$$;

-- Function to get config
CREATE OR REPLACE FUNCTION public.get_instantly_config()
RETURNS TABLE (
  id UUID,
  api_key TEXT,
  api_url TEXT,
  created_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.api_key, c.api_url, c.created_at, c.last_updated
  FROM instantly_integration.config c
  ORDER BY c.created_at DESC
  LIMIT 1;
END;
$$;

-- Function to get logs with pagination
CREATE OR REPLACE FUNCTION public.get_instantly_logs(
  page_from INT DEFAULT 0,
  page_to INT DEFAULT 24
)
RETURNS TABLE (
  id UUID,
  timestamp TIMESTAMPTZ,
  endpoint TEXT,
  status INTEGER,
  duration_ms INTEGER,
  error_message TEXT,
  count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  count_val BIGINT;
BEGIN
  -- Get count
  SELECT COUNT(*) INTO count_val FROM instantly_integration.logs;
  
  -- Return logs with pagination
  RETURN QUERY
  SELECT l.id, l.timestamp, l.endpoint, l.status, l.duration_ms, l.error_message, count_val AS count
  FROM instantly_integration.logs l
  ORDER BY l.timestamp DESC
  LIMIT (page_to - page_from + 1) OFFSET page_from;
END;
$$;
