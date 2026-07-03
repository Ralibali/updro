
-- Tighten always-true INSERT policies
DROP POLICY IF EXISTS "Anyone inserts page views" ON public.page_views;
CREATE POLICY "Anyone inserts page views" ON public.page_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (path IS NOT NULL AND session_id IS NOT NULL);

DROP POLICY IF EXISTS "Anyone inserts click events" ON public.click_events;
CREATE POLICY "Anyone inserts click events" ON public.click_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (event_name IS NOT NULL AND session_id IS NOT NULL AND path IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (email IS NOT NULL AND length(email) BETWEEN 5 AND 254 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- Lock trigger-only functions so they aren't callable via API
REVOKE EXECUTE ON FUNCTION public.close_project_on_max_offers() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_role_change() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.prevent_supplier_trust_field_changes() FROM PUBLIC, anon, authenticated, service_role;
