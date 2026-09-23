-- Buyers may create, read and delete their own projects, but moderation and
-- marketplace capacity belong to Updro. Without this guard a signed-in user can
-- call the REST API directly and insert or update a project with
-- status 'active' (skipping review), raise max_offers above three, reset
-- offer_count on a closed project or inflate its lead score.
-- guard_supplier_project_counters, which covered part of this, was dropped in
-- 20260907120000_secure_offer_agreement_flow.sql.
--
-- Server-side paths are unaffected: SECURITY DEFINER RPCs and triggers
-- (create_guest_project, submit_project_offer, decide_project_offer,
-- close_project_without_offer, claim_guest_projects,
-- close_project_on_max_offers) run as their owner, and service_role is neither
-- anon nor authenticated. Admins keep full control through is_admin().
--
-- jsonb_populate_record only touches columns that exist, so the guard also
-- works in databases where the optional verification columns were never added.
--
-- The "a_" prefix makes this BEFORE trigger fire ahead of
-- calculate_project_lead_score (triggers fire in name order), so the score is
-- always computed from values the buyer could not forge.

CREATE OR REPLACE FUNCTION public.guard_project_trusted_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_trusted constant text[] := ARRAY[
    'status', 'offer_count', 'max_offers', 'view_count', 'lead_score', 'sla_at_risk',
    'brief_verified', 'budget_verified', 'email_verified', 'phone_verified',
    'verified_at', 'verified_by', 'verification_note'
  ];
  v_values jsonb;
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_values := jsonb_build_object(
      'status', 'pending',
      'offer_count', 0,
      'max_offers', 3,
      'view_count', 0,
      'lead_score', 0,
      'sla_at_risk', false,
      'brief_verified', false,
      'budget_verified', false,
      'email_verified', false,
      'phone_verified', false,
      'verified_at', NULL,
      'verified_by', NULL,
      'verification_note', NULL
    );
  ELSE
    SELECT coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
      INTO v_values
      FROM jsonb_each(to_jsonb(OLD))
     WHERE key = ANY (v_trusted);
  END IF;

  NEW := jsonb_populate_record(NEW, v_values);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS a_guard_project_trusted_fields ON public.projects;
CREATE TRIGGER a_guard_project_trusted_fields
BEFORE INSERT OR UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.guard_project_trusted_fields();

REVOKE EXECUTE ON FUNCTION public.guard_project_trusted_fields() FROM PUBLIC, anon, authenticated;
