
REVOKE ALL ON FUNCTION public.enqueue_guest_offer_email() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.close_project_on_max_offers() FROM PUBLIC, anon, authenticated;
