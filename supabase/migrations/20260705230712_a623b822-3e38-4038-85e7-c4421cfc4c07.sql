-- Restore EXECUTE on is_admin to authenticated. RLS policies call this
-- function as the querying role, not as the definer chain, so revoking
-- EXECUTE from authenticated breaks every policy that references it
-- (projects, etc.) and blocks the dashboard.
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;