
-- ============ 1. Prevent profile role escalation ============
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin(auth.uid()) THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_change_trg ON public.profiles;
CREATE TRIGGER prevent_profile_role_change_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_change();

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============ 2. Prevent supplier self-verification ============
CREATE OR REPLACE FUNCTION public.prevent_supplier_trust_field_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    NEW.is_verified := OLD.is_verified;
    NEW.is_featured := OLD.is_featured;
    NEW.credit_check_passed := OLD.credit_check_passed;
    NEW.credit_check_at := OLD.credit_check_at;
    NEW.has_fskatt := OLD.has_fskatt;
    NEW.has_fskatt_verified_at := OLD.has_fskatt_verified_at;
    NEW.stripe_customer_id := OLD.stripe_customer_id;
    NEW.stripe_subscription_id := OLD.stripe_subscription_id;
    NEW.avg_rating := OLD.avg_rating;
    NEW.review_count := OLD.review_count;
    NEW.completed_projects := OLD.completed_projects;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_supplier_trust_change_trg ON public.supplier_profiles;
CREATE TRIGGER prevent_supplier_trust_change_trg
  BEFORE UPDATE ON public.supplier_profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_supplier_trust_field_changes();

DROP POLICY IF EXISTS "Supplier manages own" ON public.supplier_profiles;
CREATE POLICY "Supplier manages own" ON public.supplier_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============ 3. Restrict anon columns on profiles ============
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, role, full_name, company_name, city, avatar_url,
              is_bankid_verified, is_phone_verified, created_at, updated_at)
  ON public.profiles TO anon;

-- ============ 4. Restrict anon columns on supplier_profiles ============
REVOKE SELECT ON public.supplier_profiles FROM anon;
GRANT SELECT (id, slug, bio, logo_url, cover_url, categories, services,
              portfolio_urls, website_url, avg_rating, review_count,
              completed_projects, is_featured, is_verified, created_at,
              contact_name, contact_avatar_url, has_fskatt,
              has_fskatt_verified_at, credit_check_passed, credit_check_at)
  ON public.supplier_profiles TO anon;

-- ============ 5. Restrict anon columns on projects (hide buyer_id) ============
REVOKE SELECT ON public.projects FROM anon;
GRANT SELECT (id, title, description, category, budget_range, start_time,
              city, is_company, status, offer_count, view_count,
              created_at, updated_at, max_offers)
  ON public.projects TO anon;

-- ============ 6. Notifications: admin-only insert ============
DROP POLICY IF EXISTS "User inserts own notifications" ON public.notifications;
CREATE POLICY "Admin inserts notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- ============ 7. Referrals owner update/delete ============
DROP POLICY IF EXISTS "Referrer updates own referral" ON public.referrals;
CREATE POLICY "Referrer updates own referral" ON public.referrals
  FOR UPDATE TO authenticated
  USING (auth.uid() = referrer_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = referrer_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Referrer deletes own referral" ON public.referrals;
CREATE POLICY "Referrer deletes own referral" ON public.referrals
  FOR DELETE TO authenticated
  USING (auth.uid() = referrer_id OR public.is_admin(auth.uid()));

-- ============ 8. Revoke public execute on security-definer functions ============
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.close_project_on_max_offers() FROM anon, authenticated, PUBLIC;
-- trigger function still callable via the trigger itself (owner privileges)

-- ============ 9. Storage: remove broad public LIST policies (files remain reachable by public URL) ============
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Public read covers" ON storage.objects;
