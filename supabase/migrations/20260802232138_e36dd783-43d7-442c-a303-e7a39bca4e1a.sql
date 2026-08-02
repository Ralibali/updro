CREATE OR REPLACE FUNCTION public.prevent_supplier_trust_field_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF coalesce(auth.role(), '') <> 'service_role'
     AND NOT public.is_admin(auth.uid())
     AND coalesce(current_setting('app.privileged_write', true), '') <> 'on'
     AND pg_trigger_depth() <= 1 THEN
    NEW.is_verified := OLD.is_verified; NEW.is_featured := OLD.is_featured;
    NEW.credit_check_passed := OLD.credit_check_passed; NEW.credit_check_at := OLD.credit_check_at;
    NEW.has_fskatt := OLD.has_fskatt; NEW.has_fskatt_verified_at := OLD.has_fskatt_verified_at;
    NEW.stripe_customer_id := OLD.stripe_customer_id; NEW.stripe_subscription_id := OLD.stripe_subscription_id;
    NEW.plan := OLD.plan; NEW.lead_credits := OLD.lead_credits;
    NEW.trial_leads_used := OLD.trial_leads_used; NEW.trial_ends_at := OLD.trial_ends_at;
    NEW.avg_rating := OLD.avg_rating; NEW.review_count := OLD.review_count;
    NEW.completed_projects := OLD.completed_projects;
  END IF;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.unlock_project_for_supplier(p_project_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_sp public.supplier_profiles%rowtype;
  v_project public.projects%rowtype;
  v_existing public.unlocked_leads%rowtype;
  v_unlimited boolean;
  v_max int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Du måste vara inloggad.'; END IF;

  SELECT * INTO v_sp FROM public.supplier_profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Byråprofilen kunde inte hittas.'; END IF;

  SELECT * INTO v_project FROM public.projects WHERE id = p_project_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Uppdraget finns inte.'; END IF;

  SELECT * INTO v_existing FROM public.unlocked_leads
    WHERE supplier_id = v_uid AND project_id = p_project_id;
  IF FOUND THEN
    RETURN jsonb_build_object('already_unlocked', true, 'credits_left', coalesce(v_sp.lead_credits, 0));
  END IF;

  v_max := coalesce(v_project.max_offers, 3);
  IF v_project.status <> 'active' OR coalesce(v_project.offer_count, 0) >= v_max THEN
    RAISE EXCEPTION 'Uppdraget tar inte emot fler offerter.';
  END IF;

  v_unlimited := v_sp.plan = 'monthly';

  IF NOT v_unlimited THEN
    IF coalesce(v_sp.lead_credits, 0) < 1 THEN
      RAISE EXCEPTION 'Du har inga lead-krediter kvar.';
    END IF;
    PERFORM set_config('app.privileged_write', 'on', true);
    UPDATE public.supplier_profiles
      SET lead_credits = coalesce(lead_credits, 0) - 1,
          trial_leads_used = CASE WHEN v_sp.plan = 'trial' THEN coalesce(trial_leads_used, 0) + 1 ELSE trial_leads_used END
      WHERE id = v_uid
      RETURNING * INTO v_sp;
    PERFORM set_config('app.privileged_write', 'off', true);
  END IF;

  INSERT INTO public.unlocked_leads (supplier_id, project_id, used_trial_credit, credit_charged)
  VALUES (v_uid, p_project_id, NOT v_unlimited AND v_sp.plan = 'trial', NOT v_unlimited);

  RETURN jsonb_build_object('already_unlocked', false, 'credits_left', coalesce(v_sp.lead_credits, 0));
END; $function$;

CREATE OR REPLACE FUNCTION public.submit_project_offer(
  p_project_id uuid, p_title text, p_description text, p_price numeric,
  p_delivery_weeks integer DEFAULT NULL, p_payment_plan text DEFAULT 'fixed',
  p_attachment_url text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_project public.projects%rowtype;
  v_max int;
  v_offer_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Du måste vara inloggad.'; END IF;
  IF p_title IS NULL OR length(trim(p_title)) < 3 THEN RAISE EXCEPTION 'Ange en titel på offerten.'; END IF;
  IF p_description IS NULL OR length(trim(p_description)) < 20 THEN RAISE EXCEPTION 'Beskrivningen är för kort.'; END IF;
  IF p_price IS NULL OR p_price <= 0 OR p_price > 100000000 THEN RAISE EXCEPTION 'Ange ett giltigt pris.'; END IF;
  IF coalesce(p_payment_plan, 'fixed') NOT IN ('fixed','hourly','milestone') THEN RAISE EXCEPTION 'Ogiltig betalningsmodell.'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.unlocked_leads WHERE supplier_id = v_uid AND project_id = p_project_id) THEN
    RAISE EXCEPTION 'Du måste låsa upp uppdraget innan du kan skicka en offert.';
  END IF;

  SELECT * INTO v_project FROM public.projects WHERE id = p_project_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Uppdraget finns inte.'; END IF;
  v_max := coalesce(v_project.max_offers, 3);
  IF v_project.status <> 'active' OR coalesce(v_project.offer_count, 0) >= v_max THEN
    RAISE EXCEPTION 'Uppdraget tar inte emot fler offerter.';
  END IF;

  INSERT INTO public.offers (project_id, supplier_id, title, description, price, payment_plan, delivery_weeks, status, attachment_url)
  VALUES (p_project_id, v_uid, trim(p_title), trim(p_description), round(p_price, 2),
          coalesce(p_payment_plan, 'fixed'), p_delivery_weeks, 'pending', nullif(trim(coalesce(p_attachment_url, '')), ''))
  RETURNING id INTO v_offer_id;

  UPDATE public.projects SET offer_count = coalesce(offer_count, 0) + 1, updated_at = now()
    WHERE id = p_project_id;

  IF v_project.buyer_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (v_project.buyer_id, 'new_offer', 'Du har fått en ny offert',
            'En byrå har skickat en offert på "' || v_project.title || '".',
            '/dashboard/buyer/uppdrag/' || p_project_id);
  END IF;

  RETURN v_offer_id;
END; $function$;

CREATE UNIQUE INDEX IF NOT EXISTS offers_project_supplier_unique ON public.offers (project_id, supplier_id);
CREATE UNIQUE INDEX IF NOT EXISTS unlocked_leads_supplier_project_unique ON public.unlocked_leads (supplier_id, project_id);

REVOKE ALL ON FUNCTION public.unlock_project_for_supplier(uuid) FROM public;
REVOKE ALL ON FUNCTION public.submit_project_offer(uuid, text, text, numeric, integer, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.unlock_project_for_supplier(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_project_offer(uuid, text, text, numeric, integer, text, text) TO authenticated;