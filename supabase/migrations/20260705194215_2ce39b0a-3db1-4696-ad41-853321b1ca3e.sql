
-- 1) Drop anon read policies on profiles and supplier_profiles (column grants to anon are already revoked)
DROP POLICY IF EXISTS "Anon reads profiles for directory" ON public.profiles;
DROP POLICY IF EXISTS "Anon reads supplier profiles for directory" ON public.supplier_profiles;

-- 2) Restrict active-projects read policy to authenticated users only (was public)
DROP POLICY IF EXISTS "Active projects readable" ON public.projects;
CREATE POLICY "Active projects readable"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (status = 'active' OR buyer_id = auth.uid() OR public.is_admin(auth.uid()));

-- 3) Referrals: prevent referrer from modifying credits_awarded or status
DROP POLICY IF EXISTS "Referrer updates own referral" ON public.referrals;
CREATE POLICY "Referrer updates own referral"
  ON public.referrals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = referrer_id OR public.is_admin(auth.uid()))
  WITH CHECK (
    public.is_admin(auth.uid())
    OR (
      auth.uid() = referrer_id
      AND credits_awarded IS NOT DISTINCT FROM (SELECT r.credits_awarded FROM public.referrals r WHERE r.id = referrals.id)
      AND status IS NOT DISTINCT FROM (SELECT r.status FROM public.referrals r WHERE r.id = referrals.id)
    )
  );

-- 3b) Belt & suspenders: trigger to enforce the same rule at row level
CREATE OR REPLACE FUNCTION public.prevent_referral_privileged_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    NEW.credits_awarded := OLD.credits_awarded;
    NEW.status := OLD.status;
    NEW.referrer_id := OLD.referrer_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_referral_privileged_changes_trg ON public.referrals;
CREATE TRIGGER prevent_referral_privileged_changes_trg
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.prevent_referral_privileged_changes();

-- 4) Revoke EXECUTE on SECURITY DEFINER helper functions from signed-in users and PUBLIC.
--    These functions are only meant to run internally as triggers or as admin helpers.
REVOKE EXECUTE ON FUNCTION public.prevent_profile_role_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_supplier_trust_field_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_referral_privileged_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.close_project_on_max_offers() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
-- is_admin is still needed by RLS policies but those run as the row's role context;
-- policies call it via the definer chain so authenticated does not need direct EXECUTE.
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM authenticated;
