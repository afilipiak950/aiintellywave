
-- Create a view to expose the check_user_exists function results
CREATE OR REPLACE VIEW public.check_user_exists AS
SELECT 
  user_id,
  public.check_user_exists(user_id) as result
FROM (
  SELECT auth.uid() AS user_id
) dummy_row;
