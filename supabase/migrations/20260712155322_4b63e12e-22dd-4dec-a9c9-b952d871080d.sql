-- ============================================================
-- 20260712143000_production_hardening.sql
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_guest_project(
  p_email text, p_full_name text, p_company_name text, p_phone text,
  p_title text, p_description text, p_category text, p_budget_range text,
  p_start_time text, p_is_company boolean, p_source text DEFAULT 'publicera'
) RETURNS TABLE(lead_id uuid, project_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_lead_id uuid; v_project_id uuid;
BEGIN
  IF p_email IS NULL OR length(trim(p_email)) < 5 THEN RAISE EXCEPTION 'invalid_email'; END IF;
  IF p_full_name IS NULL OR length(trim(p_full_name)) < 2 THEN RAISE EXCEPTION 'invalid_name'; END IF;
  IF p_title IS NULL OR length(trim(p_title)) < 3 OR p_description IS NULL OR length(trim(p_description)) < 20 THEN RAISE EXCEPTION 'invalid_brief'; END IF;
  INSERT INTO public.guest_leads (email, full_name, company_name, phone, title, description, category, budget_range, start_time, is_company, source)
  VALUES (lower(trim(p_email)), trim(p_full_name), nullif(trim(p_company_name), ''), nullif(trim(p_phone), ''), trim(p_title), trim(p_description), p_category, p_budget_range, p_start_time, coalesce(p_is_company, true), coalesce(nullif(trim(p_source), ''), 'publicera'))
  RETURNING id INTO v_lead_id;
  INSERT INTO public.projects (buyer_id, guest_lead_id, title, description, category, budget_range, start_time, is_company, status)
  VALUES (NULL, v_lead_id, trim(p_title), trim(p_description), p_category, p_budget_range, p_start_time, coalesce(p_is_company, true), 'pending')
  RETURNING id INTO v_project_id;
  RETURN QUERY SELECT v_lead_id, v_project_id;
END; $$;
REVOKE ALL ON FUNCTION public.create_guest_project(text, text, text, text, text, text, text, text, text, boolean, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_guest_project(text, text, text, text, text, text, text, text, text, boolean, text) TO service_role;

DROP POLICY IF EXISTS "Unlocked suppliers read guest leads" ON public.guest_leads;
CREATE POLICY "Unlocked suppliers read guest leads" ON public.guest_leads FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM public.projects p JOIN public.unlocked_leads ul ON ul.project_id = p.id WHERE p.guest_lead_id = guest_leads.id AND ul.supplier_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.prevent_supplier_trust_field_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_jwt_role text := current_setting('request.jwt.claim.role', true);
BEGIN
  IF v_jwt_role = 'service_role' OR public.is_admin(auth.uid()) THEN RETURN NEW; END IF;
  NEW.is_verified := OLD.is_verified; NEW.is_featured := OLD.is_featured;
  NEW.credit_check_passed := OLD.credit_check_passed; NEW.credit_check_at := OLD.credit_check_at;
  NEW.has_fskatt := OLD.has_fskatt; NEW.has_fskatt_verified_at := OLD.has_fskatt_verified_at;
  NEW.stripe_customer_id := OLD.stripe_customer_id; NEW.stripe_subscription_id := OLD.stripe_subscription_id;
  NEW.plan := OLD.plan; NEW.lead_credits := OLD.lead_credits;
  NEW.trial_leads_used := OLD.trial_leads_used; NEW.trial_ends_at := OLD.trial_ends_at;
  NEW.avg_rating := OLD.avg_rating; NEW.review_count := OLD.review_count;
  NEW.completed_projects := OLD.completed_projects; NEW.verified_level := OLD.verified_level;
  NEW.verified_at := OLD.verified_at; NEW.verified_by := OLD.verified_by;
  NEW.f_skatt := OLD.f_skatt; NEW.company_status := OLD.company_status;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS prevent_supplier_trust_change_trg ON public.supplier_profiles;
CREATE TRIGGER prevent_supplier_trust_change_trg BEFORE UPDATE ON public.supplier_profiles FOR EACH ROW EXECUTE FUNCTION public.prevent_supplier_trust_field_changes();
REVOKE EXECUTE ON FUNCTION public.prevent_supplier_trust_field_changes() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.apply_stripe_purchase_event(
  p_event_id text, p_event_type text, p_supplier_id uuid, p_purchase_type text,
  p_amount_sek integer DEFAULT NULL, p_subscription_id text DEFAULT NULL
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_purchase_type NOT IN ('lead', 'monthly') THEN RAISE EXCEPTION 'invalid_purchase_type'; END IF;
  IF EXISTS (SELECT 1 FROM public.stripe_events WHERE stripe_event_id = p_event_id) THEN RETURN false; END IF;
  INSERT INTO public.stripe_events (stripe_event_id, event_type, supplier_id, plan, amount_sek, credits_added)
  VALUES (p_event_id, p_event_type, p_supplier_id, p_purchase_type, p_amount_sek, CASE WHEN p_purchase_type = 'lead' THEN 1 ELSE 0 END);
  IF p_purchase_type = 'lead' THEN
    UPDATE public.supplier_profiles SET lead_credits = coalesce(lead_credits, 0) + 1, plan = CASE WHEN plan = 'monthly' THEN 'monthly' ELSE 'payg' END WHERE id = p_supplier_id;
  ELSE
    UPDATE public.supplier_profiles SET plan = 'monthly', stripe_subscription_id = p_subscription_id WHERE id = p_supplier_id;
  END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'supplier_not_found'; END IF;
  RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.apply_stripe_purchase_event(text, text, uuid, text, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_stripe_purchase_event(text, text, uuid, text, integer, text) TO service_role;

CREATE OR REPLACE FUNCTION public.apply_stripe_subscription_state(
  p_event_id text, p_event_type text, p_supplier_id uuid, p_active boolean, p_subscription_id text DEFAULT NULL
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.stripe_events WHERE stripe_event_id = p_event_id) THEN RETURN false; END IF;
  INSERT INTO public.stripe_events (stripe_event_id, event_type, supplier_id, plan, credits_added)
  VALUES (p_event_id, p_event_type, p_supplier_id, CASE WHEN p_active THEN 'monthly' ELSE 'payg' END, 0);
  IF p_active THEN
    UPDATE public.supplier_profiles SET plan = 'monthly', stripe_subscription_id = p_subscription_id WHERE id = p_supplier_id;
  ELSE
    UPDATE public.supplier_profiles SET plan = 'payg', stripe_subscription_id = NULL, lead_credits = CASE WHEN coalesce(lead_credits, 0) > 100 THEN 0 ELSE coalesce(lead_credits, 0) END WHERE id = p_supplier_id;
  END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'supplier_not_found'; END IF;
  RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.apply_stripe_subscription_state(text, text, uuid, boolean, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_stripe_subscription_state(text, text, uuid, boolean, text) TO service_role;

-- ============================================================
-- 20260712180000_product_reliability.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS public.edge_rate_limits (
  rate_key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.edge_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edge_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.edge_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_edge_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_allowed boolean;
BEGIN
  IF p_key IS NULL OR length(trim(p_key)) < 3 OR p_limit < 1 OR p_window_seconds < 1 THEN RETURN false; END IF;
  INSERT INTO public.edge_rate_limits (rate_key, window_start, request_count, updated_at)
  VALUES (trim(p_key), now(), 1, now())
  ON CONFLICT (rate_key) DO UPDATE
  SET request_count = CASE WHEN edge_rate_limits.window_start <= now() - make_interval(secs => p_window_seconds) THEN 1 ELSE edge_rate_limits.request_count + 1 END,
      window_start = CASE WHEN edge_rate_limits.window_start <= now() - make_interval(secs => p_window_seconds) THEN now() ELSE edge_rate_limits.window_start END,
      updated_at = now()
  RETURNING request_count <= p_limit INTO v_allowed;
  RETURN coalesce(v_allowed, false);
END; $$;
REVOKE ALL ON FUNCTION public.consume_edge_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_edge_rate_limit(text, integer, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_guest_projects()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_email text; v_role text; v_claimed integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  v_email := lower(nullif(trim(auth.jwt() ->> 'email'), ''));
  IF v_email IS NULL THEN RAISE EXCEPTION 'verified_email_missing'; END IF;
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role IS DISTINCT FROM 'buyer' THEN RETURN 0; END IF;
  UPDATE public.projects p
  SET buyer_id = auth.uid(), guest_lead_id = NULL, email_verified = true, updated_at = now()
  WHERE p.buyer_id IS NULL AND p.guest_lead_id IN (SELECT gl.id FROM public.guest_leads gl WHERE lower(gl.email) = v_email);
  GET DIAGNOSTICS v_claimed = ROW_COUNT;
  RETURN v_claimed;
END; $$;
REVOKE ALL ON FUNCTION public.claim_guest_projects() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_guest_projects() TO authenticated;

WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY stripe_event_id ORDER BY created_at ASC NULLS LAST, id) AS row_number
  FROM public.stripe_events
)
DELETE FROM public.stripe_events se USING ranked r WHERE se.id = r.id AND r.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS stripe_events_stripe_event_id_unique ON public.stripe_events (stripe_event_id);

ALTER TABLE public.projects ALTER COLUMN max_offers SET DEFAULT 3;
UPDATE public.projects SET max_offers = 3 WHERE status IN ('pending', 'active') AND (max_offers IS NULL OR max_offers > 3);

-- ============================================================
-- 20260712190000_pending_project_notifications.sql
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_admins_about_pending_project()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'pending' AND NEW.buyer_id IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    SELECT p.id, 'new_buyer_project', 'Nytt uppdrag väntar på granskning', NEW.title || ' · ' || NEW.category, '/admin/uppdrag'
    FROM public.profiles p WHERE p.role = 'admin';
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_admins_pending_project ON public.projects;
CREATE TRIGGER trg_notify_admins_pending_project AFTER INSERT OR UPDATE OF status ON public.projects FOR EACH ROW EXECUTE FUNCTION public.notify_admins_about_pending_project();
REVOKE ALL ON FUNCTION public.notify_admins_about_pending_project() FROM PUBLIC, anon, authenticated;

-- ============================================================
-- 20260712200000_allow_trusted_system_updates.sql
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND coalesce(auth.role(), '') <> 'service_role' AND NOT public.is_admin(auth.uid()) AND pg_trigger_depth() <= 1 THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.prevent_supplier_trust_field_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF coalesce(auth.role(), '') <> 'service_role' AND NOT public.is_admin(auth.uid()) AND pg_trigger_depth() <= 1 THEN
    NEW.is_verified := OLD.is_verified; NEW.is_featured := OLD.is_featured;
    NEW.credit_check_passed := OLD.credit_check_passed; NEW.credit_check_at := OLD.credit_check_at;
    NEW.has_fskatt := OLD.has_fskatt; NEW.has_fskatt_verified_at := OLD.has_fskatt_verified_at;
    NEW.stripe_customer_id := OLD.stripe_customer_id; NEW.stripe_subscription_id := OLD.stripe_subscription_id;
    NEW.plan := OLD.plan; NEW.lead_credits := OLD.lead_credits;
    NEW.trial_leads_used := OLD.trial_leads_used; NEW.trial_ends_at := OLD.trial_ends_at;
    NEW.avg_rating := OLD.avg_rating; NEW.review_count := OLD.review_count;
    NEW.completed_projects := OLD.completed_projects; NEW.verified_level := OLD.verified_level;
    NEW.verified_at := OLD.verified_at; NEW.verified_by := OLD.verified_by;
    NEW.f_skatt := OLD.f_skatt; NEW.company_status := OLD.company_status;
  END IF;
  RETURN NEW;
END; $$;

REVOKE ALL ON FUNCTION public.prevent_profile_role_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_supplier_trust_field_changes() FROM PUBLIC, anon, authenticated;