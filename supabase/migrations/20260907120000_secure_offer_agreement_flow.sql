-- Offer decisions and account-based agreement confirmations belong in one
-- transaction. Public profiles stay private; parties receive scoped fields.
-- This is not BankID or an identity-provider signature integration.

-- Stripe already activates monthly for both monthly and annual subscriptions.
ALTER TABLE public.supplier_profiles DROP CONSTRAINT supplier_profiles_plan_check;
ALTER TABLE public.supplier_profiles ADD CONSTRAINT supplier_profiles_plan_check
  CHECK (plan IN ('none', 'trial', 'payg', 'standard', 'premium', 'monthly'));

CREATE OR REPLACE FUNCTION public.claim_guest_projects()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_email text; v_claimed integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'buyer') THEN RETURN 0; END IF;
  SELECT lower(btrim(email)) INTO v_email FROM auth.users
    WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL;
  IF v_email IS NULL THEN RETURN 0; END IF;
  UPDATE public.projects p SET buyer_id = auth.uid(), guest_lead_id = NULL, updated_at = now()
  WHERE p.buyer_id IS NULL AND p.guest_lead_id IN (
    SELECT id FROM public.guest_leads WHERE lower(btrim(email)) = v_email
  );
  GET DIAGNOSTICS v_claimed = ROW_COUNT;
  RETURN v_claimed;
END; $$;

DROP POLICY IF EXISTS "Supplier creates offer" ON public.offers;
DROP POLICY IF EXISTS "Supplier updates own offer" ON public.offers;
DROP POLICY IF EXISTS "Buyer updates offer status" ON public.offers;
DROP POLICY IF EXISTS "Supplier unlocks lead" ON public.unlocked_leads;
REVOKE INSERT, UPDATE, DELETE ON public.offers, public.unlocked_leads FROM anon, authenticated;
CREATE UNIQUE INDEX offers_one_accepted_per_project ON public.offers(project_id) WHERE status = 'accepted';

CREATE OR REPLACE FUNCTION public.protect_project_parties()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  -- Privileged claim_guest_projects may attach a verified account. A browser
  -- cannot transfer a project (and its accepted offer) to another person.
  IF current_user IN ('anon', 'authenticated') AND
    (NEW.buyer_id IS DISTINCT FROM OLD.buyer_id OR NEW.guest_lead_id IS DISTINCT FROM OLD.guest_lead_id) THEN
    RAISE EXCEPTION 'Uppdragets beställare kan inte ändras här.';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER protect_project_parties BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.protect_project_parties();

-- Supersede the older, inconsistently deployed counter triggers. The submit
-- RPC locks the project and counts actual rows; the existing close notification
-- trigger is retained but never owns offer_count.
DROP TRIGGER IF EXISTS validate_offer_before_insert ON public.offers;
DROP TRIGGER IF EXISTS sync_project_offer_count ON public.offers;
DROP TRIGGER IF EXISTS guard_supplier_project_counters ON public.projects;

CREATE POLICY "Unlocked suppliers retain project access" ON public.projects
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.unlocked_leads u
    WHERE u.project_id = projects.id AND u.supplier_id = (SELECT auth.uid()))
);

CREATE OR REPLACE FUNCTION public.unlock_project_for_supplier(p_project_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_uid uuid := auth.uid(); v_sp public.supplier_profiles%rowtype;
  v_project public.projects%rowtype; v_unlimited boolean;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Du måste vara inloggad.'; END IF;
  SELECT * INTO v_sp FROM public.supplier_profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Byråprofilen kunde inte hittas.'; END IF;
  SELECT * INTO v_project FROM public.projects WHERE id = p_project_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Uppdraget finns inte.'; END IF;
  IF EXISTS (SELECT 1 FROM public.unlocked_leads WHERE supplier_id = v_uid AND project_id = p_project_id) THEN
    RETURN jsonb_build_object('already_unlocked', true, 'credits_left', coalesce(v_sp.lead_credits, 0));
  END IF;
  IF v_project.buyer_id = v_uid THEN RAISE EXCEPTION 'Du kan inte låsa upp ditt eget uppdrag.'; END IF;
  IF v_project.status IS DISTINCT FROM 'active' OR
    (SELECT count(*) FROM public.offers WHERE project_id = p_project_id) >= coalesce(v_project.max_offers, 3) OR
    EXISTS (SELECT 1 FROM public.offers WHERE project_id = p_project_id AND status = 'accepted') THEN
    RAISE EXCEPTION 'Uppdraget tar inte emot fler offerter.';
  END IF;
  v_unlimited := coalesce(v_sp.plan = 'monthly', false);
  IF NOT v_unlimited THEN
    IF coalesce(v_sp.lead_credits, 0) < 1 THEN RAISE EXCEPTION 'Du har inga lead-krediter kvar.'; END IF;
    PERFORM set_config('app.privileged_write', 'on', true);
    UPDATE public.supplier_profiles SET lead_credits = coalesce(lead_credits, 0) - 1,
      trial_leads_used = CASE WHEN v_sp.plan = 'trial' THEN coalesce(trial_leads_used, 0) + 1 ELSE trial_leads_used END
      WHERE id = v_uid RETURNING * INTO v_sp;
    PERFORM set_config('app.privileged_write', 'off', true);
  END IF;
  INSERT INTO public.unlocked_leads(supplier_id, project_id, used_trial_credit, credit_charged)
  VALUES(v_uid, p_project_id, NOT v_unlimited AND coalesce(v_sp.plan = 'trial', false), NOT v_unlimited);
  RETURN jsonb_build_object('already_unlocked', false, 'credits_left', coalesce(v_sp.lead_credits, 0));
END; $$;

CREATE OR REPLACE FUNCTION public.submit_project_offer(
  p_project_id uuid, p_title text, p_description text, p_price numeric,
  p_delivery_weeks integer DEFAULT NULL, p_payment_plan text DEFAULT 'fixed',
  p_attachment_url text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid uuid := auth.uid(); v_project public.projects%rowtype;
  v_count integer; v_offer_id uuid;
  v_attachment text := nullif(btrim(coalesce(p_attachment_url, '')), '');
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Du måste vara inloggad.'; END IF;
  IF length(btrim(coalesce(p_title, ''))) NOT BETWEEN 3 AND 200 THEN
    RAISE EXCEPTION 'Titeln ska innehålla 3–200 tecken.';
  END IF;
  IF length(btrim(coalesce(p_description, ''))) NOT BETWEEN 20 AND 20000 THEN
    RAISE EXCEPTION 'Beskriv offerten med 20–20 000 tecken.';
  END IF;
  IF p_price IS NULL OR round(p_price, 2) <= 0 OR p_price > 100000000 OR p_price::text = 'NaN' THEN
    RAISE EXCEPTION 'Ange ett giltigt pris.';
  END IF;
  IF p_delivery_weeks IS NOT NULL AND p_delivery_weeks NOT BETWEEN 1 AND 520 THEN
    RAISE EXCEPTION 'Leveranstiden ska vara ett heltal mellan 1 och 520 veckor.';
  END IF;
  IF coalesce(p_payment_plan, 'fixed') NOT IN ('fixed', 'hourly', 'milestone') THEN
    RAISE EXCEPTION 'Ogiltig betalningsmodell.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.unlocked_leads
    WHERE supplier_id = v_uid AND project_id = p_project_id) THEN
    RAISE EXCEPTION 'Lås upp uppdraget innan du skickar offert.';
  END IF;
  SELECT * INTO v_project FROM public.projects WHERE id = p_project_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Uppdraget finns inte.'; END IF;
  IF v_project.buyer_id = v_uid THEN RAISE EXCEPTION 'Du kan inte lämna offert på ditt eget uppdrag.'; END IF;
  IF EXISTS (SELECT 1 FROM public.offers WHERE project_id = p_project_id AND supplier_id = v_uid) THEN
    RAISE EXCEPTION 'Du har redan skickat en offert på detta uppdrag.';
  END IF;
  SELECT count(*) INTO v_count FROM public.offers WHERE project_id = p_project_id;
  IF v_project.status IS DISTINCT FROM 'active' OR v_count >= coalesce(v_project.max_offers, 3) OR
    EXISTS (SELECT 1 FROM public.offers WHERE project_id = p_project_id AND status = 'accepted') THEN
    RAISE EXCEPTION 'Uppdraget tar inte emot fler offerter.';
  END IF;
  IF v_attachment IS NOT NULL AND (
    split_part(v_attachment, '/', 1) <> v_uid::text OR
    split_part(v_attachment, '/', 2) <> p_project_id::text OR
    NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'offer-attachments' AND name = v_attachment)
  ) THEN RAISE EXCEPTION 'Bilagan tillhör inte denna offert. Ladda upp filen igen.'; END IF;
  INSERT INTO public.offers(project_id, supplier_id, title, description, price, payment_plan, delivery_weeks, status, attachment_url)
  VALUES (p_project_id, v_uid, btrim(p_title), btrim(p_description), round(p_price, 2),
    coalesce(p_payment_plan, 'fixed'), p_delivery_weeks, 'pending', v_attachment)
  RETURNING id INTO v_offer_id;
  UPDATE public.projects SET offer_count = v_count + 1,
    status = CASE WHEN v_count + 1 >= coalesce(max_offers, 3) THEN 'closed' ELSE status END,
    updated_at = now() WHERE id = p_project_id;
  IF v_project.buyer_id IS NOT NULL THEN
    INSERT INTO public.notifications(user_id, type, title, message, link)
    VALUES(v_project.buyer_id, 'new_offer', 'Du har fått en ny offert',
      'En byrå har skickat en offert på "' || v_project.title || '".',
      '/dashboard/buyer/uppdrag/' || p_project_id);
  END IF;
  RETURN v_offer_id;
END; $$;

CREATE OR REPLACE FUNCTION public.decide_project_offer(p_offer_id uuid, p_decision text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_project public.projects%rowtype; v_offer public.offers%rowtype; v_project_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Du måste vara inloggad.'; END IF;
  IF p_decision IS NULL OR p_decision NOT IN ('accepted', 'declined') THEN RAISE EXCEPTION 'Ogiltigt beslut.'; END IF;
  SELECT project_id INTO v_project_id FROM public.offers WHERE id = p_offer_id;
  SELECT * INTO v_project FROM public.projects WHERE id = v_project_id FOR UPDATE;
  IF NOT FOUND OR v_project.buyer_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Bara beställaren kan fatta beslut om offerten.';
  END IF;
  SELECT * INTO v_offer FROM public.offers WHERE id = p_offer_id FOR UPDATE;
  IF v_offer.status = p_decision THEN RETURN v_offer.id; END IF;
  IF v_project.status IS NULL OR v_project.status NOT IN ('active', 'closed') THEN
    RAISE EXCEPTION 'Uppdragets status tillåter inte nya offertbeslut.';
  END IF;
  IF v_offer.status IS DISTINCT FROM 'pending' THEN RAISE EXCEPTION 'Offerten går inte längre att välja eller avböja. Ladda om sidan.'; END IF;
  IF EXISTS (SELECT 1 FROM public.offers WHERE project_id = v_project.id AND status = 'accepted') THEN
    RAISE EXCEPTION 'En offert har redan accepterats för uppdraget.';
  END IF;
  UPDATE public.offers SET status = p_decision WHERE id = v_offer.id;
  IF p_decision = 'accepted' THEN
    WITH declined AS (
      UPDATE public.offers SET status = 'declined'
      WHERE project_id = v_project.id AND id <> v_offer.id AND status = 'pending'
      RETURNING supplier_id
    ) INSERT INTO public.notifications(user_id, type, title, message, link)
      SELECT supplier_id, 'offer_declined', 'Beställaren har valt en annan offert',
        'Tack för din offert på "' || v_project.title || '".', '/dashboard/supplier/offerter' FROM declined;
    UPDATE public.projects SET status = 'closed', updated_at = now() WHERE id = v_project.id;
  END IF;
  INSERT INTO public.notifications(user_id, type, title, message, link)
  VALUES(v_offer.supplier_id, 'offer_' || p_decision,
    CASE WHEN p_decision = 'accepted' THEN 'Din offert har accepterats' ELSE 'Din offert har avböjts' END,
    'Beställaren har fattat beslut om "' || v_project.title || '".', '/dashboard/supplier/offerter');
  RETURN v_offer.id;
END; $$;

CREATE OR REPLACE FUNCTION public.close_project_without_offer(p_project_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_project public.projects%rowtype;
BEGIN
  SELECT * INTO v_project FROM public.projects WHERE id = p_project_id FOR UPDATE;
  IF auth.uid() IS NULL OR NOT FOUND OR v_project.buyer_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Bara beställaren kan stänga uppdraget.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.offers WHERE project_id = p_project_id AND status = 'accepted') THEN
    RAISE EXCEPTION 'En offert är redan accepterad. Kontakta byrån om ni behöver ändra överenskommelsen.';
  END IF;
  IF v_project.status IS NULL OR v_project.status NOT IN ('active', 'closed') THEN
    RAISE EXCEPTION 'Uppdraget kan inte stängas från denna status.';
  END IF;
  WITH declined AS (
    UPDATE public.offers SET status = 'declined' WHERE project_id = p_project_id AND status = 'pending'
    RETURNING supplier_id
  ) INSERT INTO public.notifications(user_id, type, title, message, link)
    SELECT supplier_id, 'project_closed', 'Uppdrag stängt',
      'Beställaren har stängt "' || v_project.title || '". Tack för din offert.', '/dashboard/supplier/offerter' FROM declined;
  UPDATE public.projects SET status = 'closed', updated_at = now() WHERE id = p_project_id;
  RETURN p_project_id;
END; $$;

CREATE OR REPLACE FUNCTION public.get_unlocked_project_contact(p_project_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_project public.projects%rowtype; v_result jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (SELECT 1 FROM public.unlocked_leads
    WHERE supplier_id = auth.uid() AND project_id = p_project_id) THEN
    RAISE EXCEPTION 'Lås upp uppdraget för att se kontaktuppgifterna.';
  END IF;
  SELECT * INTO v_project FROM public.projects WHERE id = p_project_id;
  IF v_project.buyer_id IS NOT NULL THEN
    SELECT jsonb_build_object('full_name', full_name, 'company_name', company_name,
      'email', email, 'phone', phone, 'city', city) INTO v_result
      FROM public.profiles WHERE id = v_project.buyer_id;
  ELSE
    SELECT jsonb_build_object('full_name', full_name, 'company_name', company_name,
      'email', email, 'phone', phone) INTO v_result FROM public.guest_leads WHERE id = v_project.guest_lead_id;
  END IF;
  RETURN v_result;
END; $$;

CREATE OR REPLACE FUNCTION public.get_buyer_project_offers(p_project_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_result jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (SELECT 1 FROM public.projects
    WHERE id = p_project_id AND buyer_id = auth.uid()) THEN
    RAISE EXCEPTION 'Bara beställaren kan läsa uppdragets offerter.';
  END IF;
  SELECT coalesce(jsonb_agg(to_jsonb(o) || jsonb_build_object(
    'profiles', jsonb_build_object('full_name', p.full_name, 'company_name', p.company_name,
      'city', p.city, 'avatar_url', p.avatar_url,
      'email', CASE WHEN o.status = 'accepted' THEN coalesce(nullif(sp.contact_email, ''), p.email) END,
      'phone', CASE WHEN o.status = 'accepted' THEN coalesce(nullif(sp.contact_phone, ''), p.phone) END),
    'supplier_profiles', jsonb_build_object('is_verified', sp.is_verified, 'has_fskatt', sp.has_fskatt,
      'credit_check_passed', sp.credit_check_passed, 'avg_rating', coalesce(a.avg_rating, 0),
      'review_count', coalesce(a.review_count, 0), 'completed_projects', coalesce(a.completed_projects, 0),
      'contact_name', CASE WHEN o.status = 'accepted' THEN sp.contact_name END)
    ) ORDER BY o.created_at DESC), '[]'::jsonb) INTO v_result
  FROM public.offers o JOIN public.profiles p ON p.id = o.supplier_id
  LEFT JOIN public.supplier_profiles sp ON sp.id = o.supplier_id
  LEFT JOIN public.get_public_agencies() a ON a.id = o.supplier_id
  WHERE o.project_id = p_project_id;
  RETURN v_result;
END; $$;

CREATE TABLE public.project_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE RESTRICT,
  offer_id uuid NOT NULL UNIQUE REFERENCES public.offers(id) ON DELETE RESTRICT,
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  supplier_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  content jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (buyer_id <> supplier_id),
  CHECK (content->>'supplier_confirmed_at' IS NULL OR content->>'buyer_confirmed_at' IS NOT NULL)
);
CREATE INDEX project_agreements_supplier_idx ON public.project_agreements(supplier_id);
CREATE INDEX project_agreements_buyer_idx ON public.project_agreements(buyer_id);
ALTER TABLE public.project_agreements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.project_agreements FROM anon, authenticated;
GRANT SELECT ON public.project_agreements TO authenticated;
CREATE POLICY "Agreement parties read" ON public.project_agreements FOR SELECT TO authenticated
USING ((SELECT auth.uid()) IN (buyer_id, supplier_id) OR public.is_admin((SELECT auth.uid())));

CREATE TABLE public.project_agreement_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  agreement_id uuid NOT NULL REFERENCES public.project_agreements(id) ON DELETE RESTRICT,
  revision integer NOT NULL,
  actor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  action text NOT NULL CHECK (action IN ('create', 'edit', 'buyer_confirm', 'supplier_confirm')),
  content jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agreement_id, revision)
);
ALTER TABLE public.project_agreement_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.project_agreement_events FROM anon, authenticated;
GRANT SELECT ON public.project_agreement_events TO authenticated;
CREATE POLICY "Agreement parties read history" ON public.project_agreement_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.project_agreements a WHERE a.id = agreement_id));

CREATE OR REPLACE FUNCTION public.get_project_agreement(p_project_id uuid, p_offer_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_offer public.offers%rowtype; v_project public.projects%rowtype; v_agreement jsonb;
  v_buyer_name text; v_supplier_name text;
BEGIN
  SELECT * INTO v_offer FROM public.offers WHERE id = p_offer_id AND project_id = p_project_id AND status = 'accepted';
  SELECT * INTO v_project FROM public.projects WHERE id = p_project_id;
  IF v_offer.id IS NULL OR auth.uid() IS NULL OR
    (auth.uid() IS DISTINCT FROM v_offer.supplier_id AND auth.uid() IS DISTINCT FROM v_project.buyer_id) THEN
    RAISE EXCEPTION 'Avtalet är bara tillgängligt för parterna i den accepterade offerten.';
  END IF;
  SELECT coalesce(nullif(company_name, ''), nullif(full_name, ''), 'Beställaren') INTO v_buyer_name FROM public.profiles WHERE id = v_project.buyer_id;
  SELECT coalesce(nullif(company_name, ''), nullif(full_name, ''), 'Byrån') INTO v_supplier_name FROM public.profiles WHERE id = v_offer.supplier_id;
  SELECT to_jsonb(a) INTO v_agreement FROM public.project_agreements a WHERE offer_id = p_offer_id;
  RETURN jsonb_build_object('agreement', v_agreement, 'context', jsonb_build_object(
    'buyerName', coalesce(v_buyer_name, 'Beställaren'), 'supplierName', v_supplier_name,
    'buyerId', v_project.buyer_id, 'supplierId', v_offer.supplier_id, 'projectTitle', v_project.title));
END; $$;

CREATE OR REPLACE FUNCTION public.update_project_agreement(
  p_offer_id uuid, p_action text, p_expected_revision integer DEFAULT 0,
  p_scope text DEFAULT NULL, p_special_terms text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_offer public.offers%rowtype; v_project public.projects%rowtype;
  v_agreement public.project_agreements%rowtype; v_context jsonb; v_content jsonb;
  v_buyer boolean; v_target uuid; v_action text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Du måste vara inloggad.'; END IF;
  IF p_action IS NULL OR p_action NOT IN ('create', 'edit', 'confirm') THEN RAISE EXCEPTION 'Ogiltig avtalsåtgärd.'; END IF;
  SELECT * INTO v_offer FROM public.offers WHERE id = p_offer_id;
  SELECT * INTO v_project FROM public.projects WHERE id = v_offer.project_id FOR UPDATE;
  v_context := public.get_project_agreement(v_project.id, p_offer_id)->'context';
  v_buyer := auth.uid() = v_project.buyer_id;
  SELECT * INTO v_agreement FROM public.project_agreements WHERE offer_id = p_offer_id FOR UPDATE;
  IF p_action = 'create' THEN
    IF v_buyer IS DISTINCT FROM true THEN RAISE EXCEPTION 'Beställaren skapar avtalet.'; END IF;
    IF v_agreement.id IS NOT NULL THEN RETURN to_jsonb(v_agreement); END IF;
    v_content := jsonb_build_object('version', 1,
      'scope', v_offer.title || E'\n\n' || v_offer.description, 'special_terms', '',
      'price_sek', v_offer.price, 'payment_plan', coalesce(v_offer.payment_plan, 'fixed'),
      'delivery_weeks', v_offer.delivery_weeks, 'project_title', v_project.title, 'offer_title', v_offer.title,
      'buyer_name', v_context->>'buyerName', 'supplier_name', v_context->>'supplierName',
      'created_at', now(), 'buyer_confirmed_at', NULL, 'supplier_confirmed_at', NULL,
      'standard_clauses', jsonb_build_array(
        'Priset avser det angivna omfånget. Ändringar eller tillägg avtalas skriftligen mellan parterna innan arbetet påbörjas.',
        'Moms tillkommer om inte annat anges.',
        'Parterna kommunicerar via Updros meddelandefunktion eller direkt via de kontaktuppgifter som delats.',
        'Eventuella tvister löses i första hand direkt mellan parterna. Updro är inte part i detta avtal och ansvarar inte för leveransen.'));
    INSERT INTO public.project_agreements(project_id, offer_id, buyer_id, supplier_id, content)
    VALUES(v_project.id, v_offer.id, v_project.buyer_id, v_offer.supplier_id, v_content) RETURNING * INTO v_agreement;
    v_action := 'create';
  ELSE
    IF v_agreement.id IS NULL THEN RAISE EXCEPTION 'Beställaren behöver först skapa avtalet.'; END IF;
    IF v_agreement.revision IS DISTINCT FROM p_expected_revision THEN
      RAISE EXCEPTION 'Avtalet har ändrats. Ladda om och granska den senaste versionen.';
    END IF;
    IF v_agreement.content->>'supplier_confirmed_at' IS NOT NULL THEN
      RAISE EXCEPTION 'Avtalet är bekräftat av båda parter och låst.';
    END IF;
    v_content := v_agreement.content;
    IF p_action = 'edit' THEN
      IF v_buyer IS DISTINCT FROM true THEN RAISE EXCEPTION 'Bara beställaren kan redigera avtalsutkastet.'; END IF;
      IF length(btrim(coalesce(p_scope, ''))) NOT BETWEEN 3 AND 30000 OR length(coalesce(p_special_terms, '')) > 10000 THEN
        RAISE EXCEPTION 'Ange omfattning (3–30 000 tecken) och högst 10 000 tecken särskilda villkor.';
      END IF;
      IF v_content->>'scope' = btrim(p_scope) AND v_content->>'special_terms' = btrim(coalesce(p_special_terms, '')) THEN
        RETURN to_jsonb(v_agreement);
      END IF;
      v_content := v_content || jsonb_build_object('scope', btrim(p_scope), 'special_terms', btrim(coalesce(p_special_terms, '')),
        'buyer_confirmed_at', NULL, 'supplier_confirmed_at', NULL);
      v_action := 'edit';
    ELSIF v_buyer THEN
      IF v_content->>'buyer_confirmed_at' IS NOT NULL THEN RETURN to_jsonb(v_agreement); END IF;
      v_content := v_content || jsonb_build_object('buyer_confirmed_at', now());
      v_action := 'buyer_confirm';
    ELSE
      IF v_content->>'buyer_confirmed_at' IS NULL THEN RAISE EXCEPTION 'Beställaren behöver bekräfta avtalet först.'; END IF;
      v_content := v_content || jsonb_build_object('supplier_confirmed_at', now());
      v_action := 'supplier_confirm';
    END IF;
    UPDATE public.project_agreements SET content = v_content, revision = revision + 1, updated_at = now()
    WHERE id = v_agreement.id RETURNING * INTO v_agreement;
    v_target := CASE WHEN v_buyer THEN v_offer.supplier_id ELSE v_project.buyer_id END;
    INSERT INTO public.notifications(user_id, type, title, message, link)
    VALUES(v_target, 'agreement_update', CASE v_action
      WHEN 'edit' THEN 'Samarbetsavtalet har ändrats'
      WHEN 'buyer_confirm' THEN 'Samarbetsavtal att bekräfta'
      ELSE 'Byrån har bekräftat avtalet' END,
      'Öppna avtalet för "' || v_project.title || '" och granska den aktuella versionen.',
      CASE WHEN v_buyer THEN '/dashboard/supplier/offerter' ELSE '/dashboard/buyer/uppdrag/' || v_project.id END);
  END IF;
  INSERT INTO public.project_agreement_events(agreement_id, revision, actor_id, action, content)
  VALUES(v_agreement.id, v_agreement.revision, auth.uid(), v_action, v_agreement.content);
  RETURN to_jsonb(v_agreement);
END; $$;

-- A buyer may read only the attachment actually submitted to their project.
DROP POLICY IF EXISTS "Parties read offer attachments" ON storage.objects;
CREATE POLICY "Parties read offer attachments" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'offer-attachments' AND (
    (storage.foldername(name))[1] = (SELECT auth.uid())::text OR public.is_admin((SELECT auth.uid())) OR
    EXISTS (SELECT 1 FROM public.offers o JOIN public.projects p ON p.id = o.project_id
      WHERE p.buyer_id = (SELECT auth.uid()) AND o.attachment_url = objects.name)
  )
);
DROP POLICY IF EXISTS "Supplier deletes own offer attachment" ON storage.objects;
CREATE POLICY "Supplier deletes unused offer attachment" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'offer-attachments' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  AND NOT EXISTS (SELECT 1 FROM public.offers o WHERE o.attachment_url = objects.name)
);
UPDATE storage.buckets SET file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
WHERE id = 'offer-attachments';

REVOKE ALL ON FUNCTION public.claim_guest_projects(), public.unlock_project_for_supplier(uuid), public.submit_project_offer(uuid,text,text,numeric,integer,text,text),
  public.decide_project_offer(uuid,text), public.close_project_without_offer(uuid),
  public.get_unlocked_project_contact(uuid), public.get_buyer_project_offers(uuid),
  public.get_project_agreement(uuid,uuid), public.update_project_agreement(uuid,text,integer,text,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_guest_projects(), public.unlock_project_for_supplier(uuid), public.submit_project_offer(uuid,text,text,numeric,integer,text,text),
  public.decide_project_offer(uuid,text), public.close_project_without_offer(uuid),
  public.get_unlocked_project_contact(uuid), public.get_buyer_project_offers(uuid),
  public.get_project_agreement(uuid,uuid), public.update_project_agreement(uuid,text,integer,text,text)
  TO authenticated;
NOTIFY pgrst, 'reload schema';
