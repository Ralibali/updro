-- Marketplace trust and notifications (2026-10-31)
--
-- 1. An unlock reserves one of the project's offer slots: seven days when a
--    credit was charged, three days on the monthly plan (free unlocks must not
--    block paying agencies for a week). A paying agency can always answer and
--    a buyer is not contacted by more agencies than there are slots. Agencies
--    are warned 48 hours before their hold runs out.
-- 2. Chat is limited to the buyer and agencies that offered, or that unlocked
--    and wrote first. It notifies the receiver and exposes counterpart names
--    through scoped RPCs instead of opening the profiles table.
-- 3. A buyer cannot silently delete a project that agencies have paid to
--    unlock or answered; closing it notifies them instead.
-- 4. Offer, decision, agreement, reminder, review, slot and chat notifications
--    are queued for e-mail (send-notification-emails). Only types listed in
--    enqueue_notification_email() are e-mailed.
-- 5. Reviews: only the project's buyer can review the accepted agency, and
--    the agency is notified by a trigger (buyers may not insert notifications).
-- 6. Server-side reminder and admin-summary functions for scheduled jobs.
-- 7. Removes the June draft debit trigger: replaying the migration folder in
--    order would otherwise charge two credits per unlock.
--
-- Safe to re-run: every object is created with OR REPLACE / IF NOT EXISTS or
-- dropped first.

-- 0. Legacy cleanup --------------------------------------------------------
DROP TRIGGER IF EXISTS debit_credit_before_unlock ON public.unlocked_leads;
DROP FUNCTION IF EXISTS public.debit_credit_before_unlock();
DROP FUNCTION IF EXISTS public.offer_slot_hold();

-- Shared Swedish wording for server-written notices.
CREATE OR REPLACE FUNCTION public.swedish_count(n integer)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT CASE WHEN n BETWEEN 0 AND 11
    THEN (ARRAY['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva'])[n + 1]
    ELSE n::text END
$$;

CREATE OR REPLACE FUNCTION public.swedish_datetime(p_at timestamptz)
RETURNS text LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT extract(day FROM t.local)::integer || ' '
    || (ARRAY['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti',
      'september', 'oktober', 'november', 'december'])[extract(month FROM t.local)::integer]
    || ' kl. ' || to_char(t.local, 'HH24:MI')
  FROM (SELECT p_at AT TIME ZONE 'Europe/Stockholm' AS local) t
$$;

-- 1. Offer slots -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.offer_slot_hold(p_paid boolean)
RETURNS interval LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT CASE WHEN p_paid THEN interval '7 days' ELSE interval '3 days' END
$$;

ALTER TABLE public.unlocked_leads ADD COLUMN IF NOT EXISTS hold_until timestamptz;
-- Unlocks made before this release were bought without a deadline, so they get
-- a full hold from today. Unlocks older than 30 days are treated as expired.
UPDATE public.unlocked_leads
SET hold_until = CASE
  WHEN created_at > now() - interval '30 days' THEN now() + public.offer_slot_hold(coalesce(credit_charged, true))
  ELSE coalesce(created_at + public.offer_slot_hold(coalesce(credit_charged, true)), now()) END
WHERE hold_until IS NULL;
ALTER TABLE public.unlocked_leads
  ALTER COLUMN hold_until SET DEFAULT (now() + interval '7 days'),
  ALTER COLUMN hold_until SET NOT NULL;
CREATE INDEX IF NOT EXISTS unlocked_leads_project_hold_idx ON public.unlocked_leads (project_id, hold_until);

-- Distinct agencies holding a slot: every offer, plus unlocks whose hold has
-- not run out and that have no approved lead-guarantee refund.
CREATE OR REPLACE FUNCTION public.project_slots_taken(p_project_id uuid, p_except_supplier uuid DEFAULT NULL)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT count(*)::integer FROM (
    SELECT o.supplier_id FROM public.offers o WHERE o.project_id = p_project_id
    UNION
    SELECT u.supplier_id FROM public.unlocked_leads u
    WHERE u.project_id = p_project_id
      AND u.hold_until > now()
      AND NOT EXISTS (
        SELECT 1 FROM public.lead_refund_requests r
        WHERE r.unlocked_lead_id = u.id AND r.status = 'approved'
      )
  ) taken
  WHERE p_except_supplier IS NULL OR taken.supplier_id IS DISTINCT FROM p_except_supplier
$$;

CREATE OR REPLACE FUNCTION public.supplier_holds_offer_slot(p_project_id uuid, p_supplier_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.unlocked_leads u
    WHERE u.project_id = p_project_id AND u.supplier_id = p_supplier_id
      AND u.hold_until > now()
      AND NOT EXISTS (
        SELECT 1 FROM public.lead_refund_requests r
        WHERE r.unlocked_lead_id = u.id AND r.status = 'approved'
      )
  )
$$;

CREATE OR REPLACE FUNCTION public.unlock_project_for_supplier(p_project_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_uid uuid := auth.uid(); v_sp public.supplier_profiles%rowtype;
  v_project public.projects%rowtype; v_unlimited boolean; v_max integer; v_hold_until timestamptz;
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
  v_max := coalesce(v_project.max_offers, 3);
  IF v_project.status IS DISTINCT FROM 'active' OR
    (SELECT count(*) FROM public.offers WHERE project_id = p_project_id) >= v_max OR
    EXISTS (SELECT 1 FROM public.offers WHERE project_id = p_project_id AND status = 'accepted') THEN
    RAISE EXCEPTION 'Uppdraget tar inte emot fler offerter.';
  END IF;
  IF public.project_slots_taken(p_project_id) >= v_max THEN
    RAISE EXCEPTION 'Alla offertplatser är reserverade av andra byråer just nu.';
  END IF;
  v_unlimited := coalesce(v_sp.plan = 'monthly', false);
  IF NOT v_unlimited THEN
    IF v_sp.plan = 'trial' AND (v_sp.trial_ends_at IS NULL OR v_sp.trial_ends_at <= now()) THEN
      RAISE EXCEPTION 'Din provperiod har gått ut. Välj en plan för att låsa upp fler uppdrag.';
    END IF;
    IF coalesce(v_sp.lead_credits, 0) < 1 THEN RAISE EXCEPTION 'Du har inga lead-krediter kvar.'; END IF;
    PERFORM set_config('app.privileged_write', 'on', true);
    UPDATE public.supplier_profiles SET lead_credits = coalesce(lead_credits, 0) - 1,
      trial_leads_used = CASE WHEN v_sp.plan = 'trial' THEN coalesce(trial_leads_used, 0) + 1 ELSE trial_leads_used END
      WHERE id = v_uid RETURNING * INTO v_sp;
    PERFORM set_config('app.privileged_write', 'off', true);
  END IF;
  v_hold_until := now() + public.offer_slot_hold(NOT v_unlimited);
  INSERT INTO public.unlocked_leads(supplier_id, project_id, used_trial_credit, credit_charged, hold_until)
  VALUES(v_uid, p_project_id, NOT v_unlimited AND coalesce(v_sp.plan = 'trial', false), NOT v_unlimited, v_hold_until);
  RETURN jsonb_build_object('already_unlocked', false, 'credits_left', coalesce(v_sp.lead_credits, 0),
    'reserved_until', v_hold_until);
END; $$;

CREATE OR REPLACE FUNCTION public.submit_project_offer(
  p_project_id uuid, p_title text, p_description text, p_price numeric,
  p_delivery_weeks integer DEFAULT NULL, p_payment_plan text DEFAULT 'fixed',
  p_attachment_url text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid uuid := auth.uid(); v_project public.projects%rowtype;
  v_count integer; v_offer_id uuid; v_max integer;
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
  v_max := coalesce(v_project.max_offers, 3);
  SELECT count(*) INTO v_count FROM public.offers WHERE project_id = p_project_id;
  IF v_project.status IS DISTINCT FROM 'active' OR v_count >= v_max OR
    EXISTS (SELECT 1 FROM public.offers WHERE project_id = p_project_id AND status = 'accepted') THEN
    RAISE EXCEPTION 'Uppdraget tar inte emot fler offerter.';
  END IF;
  -- An expired hold may still answer if a slot is free, but never take one that
  -- another agency has reserved.
  IF NOT public.supplier_holds_offer_slot(p_project_id, v_uid)
    AND public.project_slots_taken(p_project_id, v_uid) >= v_max THEN
    RAISE EXCEPTION 'Din reserverade offertplats har gått ut och de lediga platserna är tagna.';
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
    status = CASE WHEN v_count + 1 >= v_max THEN 'closed' ELSE status END,
    updated_at = now() WHERE id = p_project_id;
  IF v_project.buyer_id IS NOT NULL THEN
    INSERT INTO public.notifications(user_id, type, title, message, link)
    VALUES(v_project.buyer_id, 'new_offer', 'Du har fått en ny offert',
      'En byrå har skickat en offert på "' || v_project.title || '".',
      '/dashboard/buyer/uppdrag/' || p_project_id);
  END IF;
  RETURN v_offer_id;
END; $$;

-- Slot overview for agency listings. Mirrors the projects read policy.
CREATE OR REPLACE FUNCTION public.get_project_slot_summary(p_project_ids uuid[])
RETURNS TABLE(project_id uuid, max_offers integer, offer_count integer, slots_taken integer, my_reserved_until timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT p.id,
    coalesce(p.max_offers, 3),
    (SELECT count(*)::integer FROM public.offers o WHERE o.project_id = p.id),
    public.project_slots_taken(p.id),
    (SELECT u.hold_until FROM public.unlocked_leads u
      WHERE u.project_id = p.id AND u.supplier_id = auth.uid()
        AND public.supplier_holds_offer_slot(p.id, auth.uid())
        AND NOT EXISTS (SELECT 1 FROM public.offers o WHERE o.project_id = p.id AND o.supplier_id = auth.uid()))
  FROM public.projects p
  WHERE auth.uid() IS NOT NULL
    AND p.id = ANY (p_project_ids[1:200])
    AND (p.status = 'active' OR p.buyer_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.unlocked_leads u WHERE u.project_id = p.id AND u.supplier_id = auth.uid()))
$$;

-- 2. Chat between project parties ----------------------------------------
-- True when one of the two is the project's registered buyer and the other an
-- agency that offered on it, or that unlocked it and has written first. The
-- caller must be one of the two, so it cannot reveal other agencies' activity,
-- and a buyer cannot use it to test which agencies only unlocked.
CREATE OR REPLACE FUNCTION public.is_project_chat_pair(p_project_id uuid, p_a uuid, p_b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  WITH pair AS (
    SELECT p.id AS project_id, p.buyer_id,
      CASE WHEN p.buyer_id = p_a THEN p_b ELSE p_a END AS agency_id
    FROM public.projects p
    WHERE p.id = p_project_id
      AND p.buyer_id IS NOT NULL
      AND p_a IS DISTINCT FROM p_b
      AND auth.uid() IN (p_a, p_b)
      AND p.buyer_id IN (p_a, p_b)
  )
  SELECT EXISTS (
    SELECT 1 FROM pair
    WHERE EXISTS (SELECT 1 FROM public.offers o
        WHERE o.project_id = pair.project_id AND o.supplier_id = pair.agency_id)
      OR (EXISTS (SELECT 1 FROM public.unlocked_leads u
          WHERE u.project_id = pair.project_id AND u.supplier_id = pair.agency_id)
        AND (auth.uid() = pair.agency_id OR EXISTS (SELECT 1 FROM public.messages m
          WHERE m.project_id = pair.project_id AND m.sender_id = pair.agency_id AND m.receiver_id = pair.buyer_id)))
  )
$$;

DROP POLICY IF EXISTS "Users send own messages" ON public.messages;
DROP POLICY IF EXISTS "Project parties send messages" ON public.messages;
CREATE POLICY "Project parties send messages" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (sender_id = (SELECT auth.uid()) AND public.is_project_chat_pair(project_id, sender_id, receiver_id));

-- Senders choose only who and what; the server sets time and read state.
-- Receivers may only flip the read flag.
UPDATE public.messages SET is_read = false WHERE is_read IS NULL;
ALTER TABLE public.messages
  ALTER COLUMN is_read SET DEFAULT false,
  ALTER COLUMN is_read SET NOT NULL;
REVOKE INSERT, UPDATE, DELETE ON public.messages FROM anon, authenticated;
GRANT INSERT (project_id, sender_id, receiver_id, content) ON public.messages TO authenticated;
GRANT UPDATE (is_read) ON public.messages TO authenticated;

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_content_length;
ALTER TABLE public.messages ADD CONSTRAINT messages_content_length
  CHECK (char_length(btrim(content)) BETWEEN 1 AND 5000) NOT VALID;

DROP INDEX IF EXISTS public.messages_receiver_unread_idx;
CREATE INDEX messages_receiver_unread_idx
  ON public.messages (receiver_id, project_id, sender_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS messages_sender_created_idx ON public.messages (sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_receiver_created_idx ON public.messages (receiver_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.chat_display_name(p_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT coalesce(nullif(btrim(p.company_name), ''), nullif(btrim(sp.contact_name), ''),
    nullif(btrim(p.full_name), ''), CASE WHEN p.role = 'supplier' THEN 'Byrå' ELSE 'Beställare' END)
  FROM public.profiles p LEFT JOIN public.supplier_profiles sp ON sp.id = p.id
  WHERE p.id = p_user_id
$$;

-- One unread notice per conversation; the chat itself shows the history.
CREATE OR REPLACE FUNCTION public.notify_message_receiver()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_role text; v_link text; v_title text;
BEGIN
  BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = NEW.receiver_id;
    IF v_role IS NULL OR v_role NOT IN ('buyer', 'supplier') THEN RETURN NEW; END IF;
    v_link := '/dashboard/' || v_role || '/chatt?project=' || NEW.project_id || '&user=' || NEW.sender_id;
    IF EXISTS (SELECT 1 FROM public.notifications n
      WHERE n.user_id = NEW.receiver_id AND n.type = 'new_message' AND n.link = v_link
        AND NOT coalesce(n.is_read, false)) THEN
      RETURN NEW;
    END IF;
    SELECT title INTO v_title FROM public.projects WHERE id = NEW.project_id;
    INSERT INTO public.notifications(user_id, type, title, message, link)
    VALUES (NEW.receiver_id, 'new_message',
      left('Nytt meddelande från ' || coalesce(public.chat_display_name(NEW.sender_id), 'din motpart'), 200),
      left('"' || coalesce(v_title, 'Uppdraget') || '": ' || btrim(NEW.content), 300),
      v_link);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'notify_message_receiver(%) failed: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_message_receiver ON public.messages;
CREATE TRIGGER trg_notify_message_receiver
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_message_receiver();

CREATE OR REPLACE FUNCTION public.get_my_conversations()
RETURNS TABLE(project_id uuid, other_id uuid, other_name text, project_title text,
  last_message text, last_at timestamptz, last_from_me boolean, unread_count integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  WITH mine AS (
    SELECT m.id, m.project_id, m.sender_id, m.receiver_id, m.content, m.is_read, m.created_at,
      CASE WHEN m.sender_id = auth.uid() THEN m.receiver_id ELSE m.sender_id END AS other_id
    FROM public.messages m
    WHERE auth.uid() IS NOT NULL AND (m.sender_id = auth.uid() OR m.receiver_id = auth.uid())
  ), latest AS (
    SELECT DISTINCT ON (mine.project_id, mine.other_id)
      mine.project_id, mine.other_id, mine.content, mine.created_at, mine.sender_id
    FROM mine ORDER BY mine.project_id, mine.other_id, mine.created_at DESC, mine.id DESC
  ), unread AS (
    SELECT mine.project_id, mine.other_id, count(*)::integer AS n FROM mine
    WHERE mine.receiver_id = auth.uid() AND mine.is_read = false
    GROUP BY mine.project_id, mine.other_id
  )
  SELECT l.project_id, l.other_id, coalesce(public.chat_display_name(l.other_id), 'Motpart'),
    coalesce(pr.title, 'Uppdrag'), left(l.content, 280), l.created_at,
    l.sender_id = auth.uid(), coalesce(u.n, 0)
  FROM latest l
  LEFT JOIN public.projects pr ON pr.id = l.project_id
  LEFT JOIN unread u ON u.project_id = l.project_id AND u.other_id = l.other_id
  ORDER BY l.created_at DESC
  LIMIT 200
$$;

-- Opening a new conversation from an offer card or a project page.
CREATE OR REPLACE FUNCTION public.get_chat_party(p_project_id uuid, p_other_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_project_chat_pair(p_project_id, auth.uid(), p_other_id) THEN
    RETURN NULL;
  END IF;
  RETURN jsonb_build_object(
    'other_name', coalesce(public.chat_display_name(p_other_id), 'Motpart'),
    'project_title', (SELECT coalesce(title, 'Uppdrag') FROM public.projects WHERE id = p_project_id));
END; $$;

-- 3. Keep agencies' paid work when a buyer gives up ---------------------------
CREATE OR REPLACE FUNCTION public.project_has_agency_activity(p_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = p_project_id
      AND (p.buyer_id = auth.uid() OR public.is_admin(auth.uid()))
      AND (EXISTS (SELECT 1 FROM public.offers o WHERE o.project_id = p.id)
        OR EXISTS (SELECT 1 FROM public.unlocked_leads u WHERE u.project_id = p.id))
  )
$$;

-- SECURITY INVOKER on purpose: current_user is anon/authenticated only for
-- direct client deletes. Admin tools, service jobs and cascades are unaffected.
CREATE OR REPLACE FUNCTION public.protect_projects_with_agency_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated')
    AND NOT coalesce(public.is_admin(auth.uid()), false)
    AND public.project_has_agency_activity(OLD.id) THEN
    RAISE EXCEPTION 'Byråer har redan låst upp eller svarat på uppdraget, så det kan inte raderas. Stäng uppdraget i stället så meddelas byråerna.'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN OLD;
END; $$;

DROP TRIGGER IF EXISTS protect_projects_with_agency_activity ON public.projects;
CREATE TRIGGER protect_projects_with_agency_activity
BEFORE DELETE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.protect_projects_with_agency_activity();

-- Tells agencies that unlocked but never answered that the project is over.
-- Idempotent per agency and project, so a full project closed later, or a
-- retried close, never notifies twice.
CREATE OR REPLACE FUNCTION public.notify_unanswered_unlocks(p_project_id uuid, p_title text, p_message text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_link text := '/dashboard/supplier/uppdrag/' || p_project_id; v_count integer;
BEGIN
  INSERT INTO public.notifications(user_id, type, title, message, link)
  SELECT u.supplier_id, 'project_closed', p_title, p_message, v_link
  FROM public.unlocked_leads u
  WHERE u.project_id = p_project_id
    AND NOT EXISTS (SELECT 1 FROM public.offers o WHERE o.project_id = p_project_id AND o.supplier_id = u.supplier_id)
    AND NOT EXISTS (SELECT 1 FROM public.notifications n
      WHERE n.user_id = u.supplier_id AND n.type = 'project_closed' AND n.link = v_link);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
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
    PERFORM public.notify_unanswered_unlocks(v_project.id, 'Uppdraget har tilldelats en byrå',
      'Beställaren har valt en byrå för "' || v_project.title || '". Uppdraget tar inte emot fler offerter.');
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
  PERFORM public.notify_unanswered_unlocks(p_project_id, 'Uppdrag stängt',
    'Beställaren har stängt "' || v_project.title || '" innan du hann svara. Uppdraget tar inte emot fler offerter.');
  UPDATE public.projects SET status = 'closed', updated_at = now() WHERE id = p_project_id;
  RETURN p_project_id;
END; $$;

-- 4. E-mail for important notifications ------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL UNIQUE REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'skipped')),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  send_after timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notification_email_queue_due_idx
  ON public.notification_email_queue (status, send_after);
ALTER TABLE public.notification_email_queue ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.notification_email_queue FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.notification_email_queue TO authenticated;
GRANT ALL ON public.notification_email_queue TO service_role;
DROP POLICY IF EXISTS "Admins read notification e-mails" ON public.notification_email_queue;
CREATE POLICY "Admins read notification e-mails" ON public.notification_email_queue
FOR SELECT TO authenticated USING (public.is_admin((SELECT auth.uid())));

-- Chat e-mails wait ten minutes and are skipped if the notice was read by then.
CREATE OR REPLACE FUNCTION public.enqueue_notification_email()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.type IN ('new_offer', 'offer_accepted', 'offer_declined', 'project_closed',
    'agreement_update', 'new_message', 'offer_reminder', 'new_review', 'slot_expiring') THEN
    BEGIN
      INSERT INTO public.notification_email_queue(notification_id, user_id, type, send_after)
      VALUES (NEW.id, NEW.user_id, NEW.type,
        now() + CASE WHEN NEW.type = 'new_message' THEN interval '10 minutes' ELSE interval '0 seconds' END)
      ON CONFLICT (notification_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'enqueue_notification_email(%) failed: %', NEW.id, SQLERRM;
    END;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_enqueue_notification_email ON public.notifications;
CREATE TRIGGER trg_enqueue_notification_email
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.enqueue_notification_email();

-- Users may only mark their own notices read; the rest is written by the server.
REVOKE UPDATE ON public.notifications FROM anon, authenticated;
GRANT UPDATE (is_read) ON public.notifications TO authenticated;
CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_type_link_idx ON public.notifications (user_id, type, link);

-- The guest mailer now claims rows before sending, like the agency lead alerts.
ALTER TABLE public.guest_offer_email_queue DROP CONSTRAINT IF EXISTS guest_offer_email_queue_status_check;
ALTER TABLE public.guest_offer_email_queue ADD CONSTRAINT guest_offer_email_queue_status_check
  CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'skipped'));

-- 5. Reviews ----------------------------------------------------------------------
-- Only the project's buyer may review the agency whose offer they accepted, the
-- same rule get_public_agencies() uses for public ratings.
CREATE OR REPLACE FUNCTION public.is_reviewable_engagement(p_project_id uuid, p_supplier_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.offers o ON o.project_id = p.id
    WHERE p.id = p_project_id AND p.buyer_id = auth.uid()
      AND o.supplier_id = p_supplier_id AND o.status = 'accepted'
  )
$$;

DROP POLICY IF EXISTS "Buyer writes review" ON public.reviews;
CREATE POLICY "Buyer writes review" ON public.reviews
FOR INSERT TO authenticated
WITH CHECK (buyer_id = (SELECT auth.uid()) AND public.is_reviewable_engagement(project_id, supplier_id));

-- Buyers may not insert notifications, so the notice ReviewCard tried to create
-- never arrived. The trigger re-checks the engagement for server-side inserts.
CREATE OR REPLACE FUNCTION public.notify_supplier_on_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_title text;
BEGIN
  BEGIN
    SELECT p.title INTO v_title
    FROM public.projects p
    JOIN public.offers o ON o.project_id = p.id
    WHERE p.id = NEW.project_id AND p.buyer_id = NEW.buyer_id
      AND o.supplier_id = NEW.supplier_id AND o.status = 'accepted';
    IF FOUND THEN
      INSERT INTO public.notifications(user_id, type, title, message, link)
      VALUES (NEW.supplier_id, 'new_review', 'Nytt omdöme mottaget',
        'Beställaren har gett er betyget ' || public.swedish_count(NEW.rating)
          || ' av fem för "' || coalesce(v_title, 'uppdraget') || '".',
        '/dashboard/supplier/profil');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'notify_supplier_on_review(%) failed: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_supplier_on_review ON public.reviews;
CREATE TRIGGER trg_notify_supplier_on_review
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.notify_supplier_on_review();

-- 6. Scheduled notices (called by offer-reminder-cron) -----------------------------
-- Warns an agency once, 48 hours before its reserved slot runs out.
CREATE OR REPLACE FUNCTION public.notify_expiring_offer_slots()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_count integer;
BEGIN
  INSERT INTO public.notifications(user_id, type, title, message, link)
  SELECT u.supplier_id, 'slot_expiring', 'Er offertplats går snart ut',
    'Er reserverade plats på "' || p.title || '" gäller till ' || public.swedish_datetime(u.hold_until)
      || '. Skicka offerten innan dess, annars kan platsen gå till en annan byrå.'
      || CASE WHEN u.credit_charged AND u.created_at + interval '7 days' > now()
        THEN ' Går kunden inte att nå kan ni använda leadgarantin fram till '
          || public.swedish_datetime(u.created_at + interval '7 days') || '.'
        ELSE '' END,
    '/dashboard/supplier/uppdrag/' || p.id
  FROM public.unlocked_leads u
  JOIN public.projects p ON p.id = u.project_id
  WHERE u.hold_until > now() AND u.hold_until <= now() + interval '48 hours'
    AND p.status = 'active'
    AND NOT EXISTS (SELECT 1 FROM public.offers o WHERE o.project_id = p.id AND o.supplier_id = u.supplier_id)
    AND NOT EXISTS (SELECT 1 FROM public.lead_refund_requests r WHERE r.unlocked_lead_id = u.id AND r.status = 'approved')
    AND NOT EXISTS (SELECT 1 FROM public.notifications n
      WHERE n.user_id = u.supplier_id AND n.type = 'slot_expiring' AND n.link = '/dashboard/supplier/uppdrag/' || p.id);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END; $$;

-- Reminds registered buyers about undecided offers: at most every three days
-- and at most three times per project. Full (closed) projects are included,
-- since that is where the decision is left.
CREATE OR REPLACE FUNCTION public.send_offer_decision_reminders()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_count integer;
BEGIN
  WITH undecided AS (
    SELECT p.id, p.title, p.buyer_id,
      count(*) FILTER (WHERE o.status = 'pending')::integer AS pending,
      '/dashboard/buyer/uppdrag/' || p.id AS link
    FROM public.projects p
    JOIN public.offers o ON o.project_id = p.id
    WHERE p.buyer_id IS NOT NULL AND p.status IN ('active', 'closed')
    GROUP BY p.id
    HAVING count(*) FILTER (WHERE o.status = 'accepted') = 0
      AND min(o.created_at) FILTER (WHERE o.status = 'pending') < now() - interval '5 days'
  )
  INSERT INTO public.notifications(user_id, type, title, message, link)
  SELECT d.buyer_id, 'offer_reminder', 'Dina offerter väntar på svar',
    'På "' || d.title || '" ' || CASE WHEN d.pending = 1 THEN 'väntar en byrå' ELSE 'väntar ' || public.swedish_count(d.pending) || ' byråer' END
      || ' på ditt besked. Välj en offert eller avböj, så vet byråerna var de står.',
    d.link
  FROM undecided d
  WHERE NOT EXISTS (SELECT 1 FROM public.notifications n
      WHERE n.user_id = d.buyer_id AND n.type = 'offer_reminder' AND n.link = d.link
        AND n.created_at > now() - interval '3 days')
    AND (SELECT count(*) FROM public.notifications n
      WHERE n.user_id = d.buyer_id AND n.type = 'offer_reminder' AND n.link = d.link) < 3;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END; $$;

-- Per-function health for the admin page, aggregated on the server so busy
-- jobs cannot push quiet ones out of a row limit.
CREATE OR REPLACE FUNCTION public.admin_edge_function_summary(p_since timestamptz, p_names text[])
RETURNS TABLE(function_name text, total integer, errors integer, last_run timestamptz,
  avg_ms integer, median_ms integer, p95_ms integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Endast administratörer kan läsa funktionsloggen.';
  END IF;
  RETURN QUERY
  SELECT n.name,
    count(l.id)::integer,
    (count(l.id) FILTER (WHERE NOT l.ok))::integer,
    (SELECT max(x.created_at) FROM public.edge_function_logs x WHERE x.function_name = n.name),
    coalesce(round(avg(l.duration_ms))::integer, 0),
    coalesce(round(percentile_cont(0.5) WITHIN GROUP (ORDER BY l.duration_ms))::integer, 0),
    coalesce(round(percentile_cont(0.95) WITHIN GROUP (ORDER BY l.duration_ms))::integer, 0)
  FROM unnest(p_names[1:50]) AS n(name)
  LEFT JOIN public.edge_function_logs l ON l.function_name = n.name AND l.created_at >= p_since
  GROUP BY n.name;
END; $$;

-- Privileges ---------------------------------------------------------------
REVOKE ALL ON FUNCTION public.swedish_count(integer), public.swedish_datetime(timestamptz),
  public.offer_slot_hold(boolean), public.project_slots_taken(uuid, uuid),
  public.supplier_holds_offer_slot(uuid, uuid), public.chat_display_name(uuid),
  public.notify_message_receiver(), public.enqueue_notification_email(),
  public.protect_projects_with_agency_activity(), public.notify_supplier_on_review(),
  public.notify_unanswered_unlocks(uuid, text, text), public.notify_expiring_offer_slots(),
  public.send_offer_decision_reminders()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.unlock_project_for_supplier(uuid),
  public.submit_project_offer(uuid, text, text, numeric, integer, text, text),
  public.decide_project_offer(uuid, text), public.close_project_without_offer(uuid),
  public.get_project_slot_summary(uuid[]), public.is_project_chat_pair(uuid, uuid, uuid),
  public.get_my_conversations(), public.get_chat_party(uuid, uuid),
  public.project_has_agency_activity(uuid), public.is_reviewable_engagement(uuid, uuid),
  public.admin_edge_function_summary(timestamptz, text[])
  FROM PUBLIC, anon;
-- is_project_chat_pair, project_has_agency_activity and is_reviewable_engagement
-- are evaluated as the signed-in user inside policies and the delete trigger.
GRANT EXECUTE ON FUNCTION public.unlock_project_for_supplier(uuid),
  public.submit_project_offer(uuid, text, text, numeric, integer, text, text),
  public.decide_project_offer(uuid, text), public.close_project_without_offer(uuid),
  public.get_project_slot_summary(uuid[]), public.is_project_chat_pair(uuid, uuid, uuid),
  public.get_my_conversations(), public.get_chat_party(uuid, uuid),
  public.project_has_agency_activity(uuid), public.is_reviewable_engagement(uuid, uuid),
  public.admin_edge_function_summary(timestamptz, text[])
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_expiring_offer_slots(), public.send_offer_decision_reminders(),
  public.project_slots_taken(uuid, uuid), public.supplier_holds_offer_slot(uuid, uuid)
  TO service_role;

NOTIFY pgrst, 'reload schema';
