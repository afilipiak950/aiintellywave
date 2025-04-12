
-- Create a view to expose the check_user_exists function results
CREATE OR REPLACE VIEW public.check_user_exists AS
SELECT 
  auth.uid() AS user_id,
  public.check_user_exists(auth.uid()) as result
FROM (
  SELECT 1
) dummy_row;

