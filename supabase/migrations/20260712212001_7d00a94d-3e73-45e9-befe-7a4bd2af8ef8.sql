REVOKE EXECUTE ON FUNCTION public.apply_stripe_purchase_event(text, text, uuid, text, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_stripe_purchase_event(text, text, uuid, text, integer, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.apply_stripe_subscription_state(text, text, uuid, boolean, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_stripe_subscription_state(text, text, uuid, boolean, text) TO service_role;