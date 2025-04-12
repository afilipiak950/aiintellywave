
-- Create a view to expose the check_user_exists function results
CREATE VIEW public.check_user_exists AS
SELECT 
  user_id,
  public.check_user_exists(user_id) as result
FROM (
  SELECT uuid_generate_v4() AS user_id
) dummy_row;
