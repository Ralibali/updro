-- Synthetic checks for 20260923100000_guard_project_trusted_fields and
-- 20260923101000_notify_agencies_on_project_approval. Always rolled back; run
-- after migrations. No real users, projects or e-mails are involved: queued
-- alerts are rolled back before send-supplier-lead-alerts can see them.
BEGIN;
CREATE FUNCTION pg_temp.qa_id(n integer) RETURNS uuid LANGUAGE sql IMMUTABLE AS $$
  SELECT ('d70b0000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid;
$$;
CREATE TEMP TABLE qa_checks(label text);
GRANT ALL ON qa_checks TO authenticated, anon, service_role;
CREATE FUNCTION pg_temp.check_ok(ok boolean, label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'QA assertion failed: %', label; END IF;
  INSERT INTO qa_checks VALUES(label);
END; $$;
CREATE FUNCTION pg_temp.expect_error(query text, fragment text, label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  BEGIN
    EXECUTE query;
  EXCEPTION WHEN OTHERS THEN
    IF strpos(SQLERRM, fragment) = 0 THEN RAISE EXCEPTION 'QA %: unexpected error %', label, SQLERRM; END IF;
    INSERT INTO qa_checks VALUES(label);
    RETURN;
  END;
  RAISE EXCEPTION 'QA %: operation unexpectedly succeeded', label;
END; $$;

-- 1 buyer, 2 admin, 3 web agency, 4 SEO agency, 5 agency without categories,
-- 6 web agency that opted out of lead e-mails.
INSERT INTO auth.users(id, email, email_confirmed_at)
SELECT pg_temp.qa_id(n), 'updro-guard-qa-' || n || '@example.invalid', now() FROM generate_series(1, 6) n;
INSERT INTO public.profiles(id, role, full_name, email)
SELECT pg_temp.qa_id(n), CASE n WHEN 1 THEN 'buyer' WHEN 2 THEN 'admin' ELSE 'supplier' END,
  'Synthetic QA ' || n, 'updro-guard-qa-' || n || '@example.invalid'
FROM generate_series(1, 6) n;
INSERT INTO public.supplier_profiles(id, slug, plan, lead_credits, categories, lead_alert_emails)
VALUES (pg_temp.qa_id(3), 'synthetic-guard-qa-3', 'payg', 0, ARRAY['Webbutveckling'], true),
  (pg_temp.qa_id(4), 'synthetic-guard-qa-4', 'payg', 0, ARRAY['SEO'], true),
  (pg_temp.qa_id(5), 'synthetic-guard-qa-5', 'payg', 0, ARRAY[]::text[], true),
  (pg_temp.qa_id(6), 'synthetic-guard-qa-6', 'payg', 0, ARRAY['Webbutveckling'], false);

-- Buyer: may create and edit, may not publish or change capacity.
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(1)::text, true), set_config('request.jwt.claim.role', 'authenticated', true);
SET LOCAL ROLE authenticated;
INSERT INTO public.projects(id, buyer_id, title, description, category, status, max_offers, offer_count)
VALUES (pg_temp.qa_id(10), pg_temp.qa_id(1), 'SYNTHETIC GUARD QA', 'Synthetic fixture, never a real project.', 'Webbutveckling', 'active', 50, 9);
SELECT pg_temp.check_ok((SELECT status = 'pending' AND max_offers = 3 AND offer_count = 0 FROM public.projects WHERE id = pg_temp.qa_id(10)), 'buyer insert is forced to pending with three offer slots');
UPDATE public.projects SET status = 'active', max_offers = 10, offer_count = 0, title = 'SYNTHETIC GUARD QA edited' WHERE id = pg_temp.qa_id(10);
SELECT pg_temp.check_ok((SELECT status = 'pending' AND max_offers = 3 AND title = 'SYNTHETIC GUARD QA edited' FROM public.projects WHERE id = pg_temp.qa_id(10)), 'buyer update keeps trusted fields but saves ordinary edits');
SELECT pg_temp.check_ok((SELECT count(*) = 0 FROM public.supplier_lead_alert_queue), 'buyer cannot read the e-mail queue');
SELECT pg_temp.expect_error('INSERT INTO public.supplier_lead_alert_queue(supplier_id, project_id) VALUES(pg_temp.qa_id(3), pg_temp.qa_id(10))', 'permission denied', 'buyer cannot queue e-mails');
RESET ROLE;
SELECT pg_temp.check_ok((SELECT count(*) = 0 FROM public.supplier_notifications WHERE supplier_id BETWEEN pg_temp.qa_id(3) AND pg_temp.qa_id(6) AND project_id = pg_temp.qa_id(10)), 'no agency alert while project is pending');

-- Admin approval opens the project and alerts matching agencies once.
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(2)::text, true);
SET LOCAL ROLE authenticated;
UPDATE public.projects SET status = 'active' WHERE id = pg_temp.qa_id(10);
RESET ROLE;
SELECT pg_temp.check_ok((SELECT status = 'active' FROM public.projects WHERE id = pg_temp.qa_id(10)), 'admin can approve');
SELECT pg_temp.check_ok((SELECT array_agg(supplier_id ORDER BY supplier_id) = ARRAY[pg_temp.qa_id(3), pg_temp.qa_id(5), pg_temp.qa_id(6)]
  FROM public.supplier_notifications WHERE supplier_id BETWEEN pg_temp.qa_id(3) AND pg_temp.qa_id(6) AND project_id = pg_temp.qa_id(10)), 'matching and uncategorised agencies get an in-app alert');
SELECT pg_temp.check_ok((SELECT array_agg(supplier_id ORDER BY supplier_id) = ARRAY[pg_temp.qa_id(3), pg_temp.qa_id(5)]
  FROM public.supplier_lead_alert_queue WHERE supplier_id BETWEEN pg_temp.qa_id(3) AND pg_temp.qa_id(6) AND project_id = pg_temp.qa_id(10) AND status = 'pending'), 'e-mail queued except for opted-out agency');
SELECT pg_temp.check_ok((SELECT count(*) = 3 FROM public.notifications
  WHERE user_id BETWEEN pg_temp.qa_id(3) AND pg_temp.qa_id(6) AND link = '/dashboard/supplier/uppdrag/' || pg_temp.qa_id(10)::text), 'alerts mirrored to the bell feed');

SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(2)::text, true);
SET LOCAL ROLE authenticated;
UPDATE public.projects SET status = 'closed' WHERE id = pg_temp.qa_id(10);
UPDATE public.projects SET status = 'active' WHERE id = pg_temp.qa_id(10);
RESET ROLE;
SELECT pg_temp.check_ok((SELECT count(*) = 3 FROM public.supplier_notifications WHERE supplier_id BETWEEN pg_temp.qa_id(3) AND pg_temp.qa_id(6) AND project_id = pg_temp.qa_id(10))
  AND (SELECT count(*) = 2 FROM public.supplier_lead_alert_queue WHERE supplier_id BETWEEN pg_temp.qa_id(3) AND pg_temp.qa_id(6) AND project_id = pg_temp.qa_id(10)), 're-opening does not alert twice');

-- Server-side creation of an already active project (trusted path) alerts too.
INSERT INTO public.projects(id, buyer_id, title, description, category, status)
VALUES (pg_temp.qa_id(11), pg_temp.qa_id(1), 'SYNTHETIC SERVER QA', 'Synthetic fixture, never a real project.', 'SEO', 'active');
SELECT pg_temp.check_ok((SELECT array_agg(supplier_id ORDER BY supplier_id) = ARRAY[pg_temp.qa_id(4), pg_temp.qa_id(5)]
  FROM public.supplier_lead_alert_queue WHERE supplier_id BETWEEN pg_temp.qa_id(3) AND pg_temp.qa_id(6) AND project_id = pg_temp.qa_id(11)), 'server-created active project alerts matching agencies');

-- Agencies only see their own feed.
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(3)::text, true);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok((SELECT count(*) = 1 AND bool_and(supplier_id = auth.uid()) FROM public.supplier_notifications), 'agency reads only its own alerts');
RESET ROLE;

SELECT count(*) AS passed_checks, jsonb_agg(label) AS checks FROM qa_checks;
ROLLBACK;
