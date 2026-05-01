-- Restore EXECUTE on has_role for authenticated users.
-- This function is SECURITY DEFINER and only checks role membership,
-- so it is safe to expose to authenticated users (and required by all RLS policies).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;