-- Allow service-role operations and nested database triggers to maintain system fields,
-- while still preventing ordinary suppliers from changing trust, billing or credit fields.

CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND coalesce(auth.role(), '') <> 'service_role'
     AND NOT public.is_admin(auth.uid())
     AND pg_trigger_depth() <= 1 THEN
    NEW.role := OLD.role;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_supplier_trust_field_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.role(), '') <> 'service_role'
     AND NOT public.is_admin(auth.uid())
     AND pg_trigger_depth() <= 1 THEN
    NEW.is_verified := OLD.is_verified;
    NEW.is_featured := OLD.is_featured;
    NEW.credit_check_passed := OLD.credit_check_passed;
    NEW.credit_check_at := OLD.credit_check_at;
    NEW.has_fskatt := OLD.has_fskatt;
    NEW.has_fskatt_verified_at := OLD.has_fskatt_verified_at;
    NEW.stripe_customer_id := OLD.stripe_customer_id;
    NEW.stripe_subscription_id := OLD.stripe_subscription_id;
    NEW.plan := OLD.plan;
    NEW.lead_credits := OLD.lead_credits;
    NEW.trial_leads_used := OLD.trial_leads_used;
    NEW.trial_ends_at := OLD.trial_ends_at;
    NEW.avg_rating := OLD.avg_rating;
    NEW.review_count := OLD.review_count;
    NEW.completed_projects := OLD.completed_projects;
    NEW.verified_level := OLD.verified_level;
    NEW.verified_at := OLD.verified_at;
    NEW.verified_by := OLD.verified_by;
    NEW.f_skatt := OLD.f_skatt;
    NEW.company_status := OLD.company_status;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_profile_role_change()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_supplier_trust_field_changes()
  FROM PUBLIC, anon, authenticated;
