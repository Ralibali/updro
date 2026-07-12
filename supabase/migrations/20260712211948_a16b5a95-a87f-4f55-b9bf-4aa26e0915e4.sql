CREATE OR REPLACE FUNCTION public.apply_stripe_purchase_event(
  p_event_id text,
  p_event_type text,
  p_supplier_id uuid,
  p_purchase_type text,
  p_amount_sek integer DEFAULT NULL::integer,
  p_subscription_id text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_purchase_type NOT IN ('lead', 'monthly', 'yearly') THEN RAISE EXCEPTION 'invalid_purchase_type'; END IF;
  IF EXISTS (SELECT 1 FROM public.stripe_events WHERE stripe_event_id = p_event_id) THEN RETURN false; END IF;
  INSERT INTO public.stripe_events (stripe_event_id, event_type, supplier_id, plan, amount_sek, credits_added)
  VALUES (p_event_id, p_event_type, p_supplier_id, p_purchase_type, p_amount_sek, CASE WHEN p_purchase_type = 'lead' THEN 1 ELSE 0 END);
  IF p_purchase_type = 'lead' THEN
    UPDATE public.supplier_profiles SET lead_credits = coalesce(lead_credits, 0) + 1, plan = CASE WHEN plan = 'monthly' THEN 'monthly' ELSE 'payg' END WHERE id = p_supplier_id;
  ELSE
    -- monthly OR yearly: aktivera obegränsad plan
    UPDATE public.supplier_profiles SET plan = 'monthly', stripe_subscription_id = p_subscription_id WHERE id = p_supplier_id;
  END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'supplier_not_found'; END IF;
  RETURN true;
END; $function$;