-- Synthetic integration checks. Always rolled back; run after migrations.
-- No real users, payments, email sends or agreements are involved.
BEGIN;
CREATE FUNCTION pg_temp.qa_id(n integer) RETURNS uuid LANGUAGE sql IMMUTABLE AS $$
  SELECT ('d70a0000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid;
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

INSERT INTO auth.users(id, email, email_confirmed_at)
SELECT pg_temp.qa_id(n), 'updro-transaction-qa-' || n || '@example.invalid', CASE WHEN n = 2 THEN NULL ELSE now() END
FROM generate_series(1, 6) n;
INSERT INTO public.profiles(id, role, full_name, company_name, email, phone)
SELECT pg_temp.qa_id(n), CASE WHEN n <= 2 THEN 'buyer' ELSE 'supplier' END,
  'Synthetic QA ' || n, 'Synthetic QA company ' || n, 'updro-transaction-qa-' || n || '@example.invalid', '+46000000000'
FROM generate_series(1, 6) n;
INSERT INTO public.supplier_profiles(id, slug, plan, lead_credits)
SELECT pg_temp.qa_id(n), 'synthetic-transaction-qa-' || n, 'payg', 3 FROM generate_series(3, 6) n;
INSERT INTO public.projects(id, buyer_id, title, description, category, status, max_offers)
VALUES(pg_temp.qa_id(10), pg_temp.qa_id(1), 'SYNTHETIC ROLLBACK QA', 'Synthetic fixture, never a real project.', 'Webbutveckling', 'active', 2),
  (pg_temp.qa_id(11), pg_temp.qa_id(2), 'SYNTHETIC CAPACITY QA', 'Synthetic fixture, never a real project.', 'Webbutveckling', 'active', 1);
INSERT INTO public.guest_leads(id, email, full_name, title, description, category, budget_range, start_time)
VALUES(pg_temp.qa_id(30), 'updro-transaction-qa-2@example.invalid', 'Synthetic guest', 'SYNTHETIC GUEST QA',
  'Synthetic fixture, never a real request.', 'Webbutveckling', 'unknown', 'flexible');
INSERT INTO public.projects(id, guest_lead_id, title, description, category, status)
VALUES(pg_temp.qa_id(12), pg_temp.qa_id(30), 'SYNTHETIC GUEST QA', 'Synthetic fixture, never a real project.', 'Webbutveckling', 'active');
INSERT INTO storage.objects(bucket_id, name)
VALUES('offer-attachments', pg_temp.qa_id(3)::text || '/' || pg_temp.qa_id(10)::text || '/qa.pdf'),
  ('offer-attachments', pg_temp.qa_id(3)::text || '/' || pg_temp.qa_id(11)::text || '/private-other-project.pdf');

SET LOCAL ROLE anon;
SELECT pg_temp.expect_error('SELECT public.get_buyer_project_offers(pg_temp.qa_id(10))', 'permission denied', 'anonymous cannot call private offer RPC');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(3)::text, true), set_config('request.jwt.claim.role', 'authenticated', true);
SET LOCAL ROLE authenticated;
SELECT pg_temp.expect_error('INSERT INTO public.unlocked_leads(supplier_id, project_id) VALUES(auth.uid(), pg_temp.qa_id(10))', 'permission denied', 'cannot bypass lead charge');
SELECT pg_temp.expect_error('INSERT INTO public.offers(project_id,supplier_id,title,description,price) VALUES(pg_temp.qa_id(10),auth.uid(),''QA'',''Synthetic description'',100)', 'permission denied', 'cannot bypass offer RPC');
SELECT pg_temp.expect_error('SELECT public.submit_project_offer(pg_temp.qa_id(10),''Synthetic offer'',''Synthetic sufficiently long description'',100)', 'Lås upp', 'offer requires unlock');
SELECT pg_temp.expect_error('SELECT public.get_unlocked_project_contact(pg_temp.qa_id(10))', 'Lås upp', 'contact hidden before unlock');
SELECT pg_temp.check_ok(public.unlock_project_for_supplier(pg_temp.qa_id(10))->>'credits_left' = '2', 'unlock charges one credit');
SELECT pg_temp.check_ok(public.unlock_project_for_supplier(pg_temp.qa_id(10))->>'already_unlocked' = 'true', 'unlock retry is idempotent');
SELECT pg_temp.check_ok((SELECT lead_credits = 2 FROM public.supplier_profiles WHERE id = auth.uid()), 'unlock retry did not charge again');
SELECT pg_temp.check_ok(public.get_unlocked_project_contact(pg_temp.qa_id(10))->>'email' = 'updro-transaction-qa-1@example.invalid', 'registered contact available after unlock');
SELECT pg_temp.expect_error('SELECT public.submit_project_offer(pg_temp.qa_id(10),''Synthetic offer'',''Synthetic sufficiently long description'',''NaN''::numeric)', 'giltigt pris', 'NaN price rejected');
SELECT pg_temp.expect_error('SELECT public.submit_project_offer(pg_temp.qa_id(10),''Synthetic offer'',''Synthetic sufficiently long description'',100,0)', 'Leveranstiden', 'invalid delivery rejected');
SELECT pg_temp.expect_error('SELECT public.submit_project_offer(pg_temp.qa_id(10),''Synthetic offer'',''Synthetic sufficiently long description'',100,1,''fixed'',''foreign/path.pdf'')', 'Bilagan', 'foreign attachment rejected');
SELECT set_config('qa.offer_one', public.submit_project_offer(pg_temp.qa_id(10), 'Synthetic offer one', repeat('Full scope preserved. ', 40), 1200, 4, 'hourly', pg_temp.qa_id(3)::text || '/' || pg_temp.qa_id(10)::text || '/qa.pdf')::text, true);
SELECT pg_temp.expect_error('SELECT public.submit_project_offer(pg_temp.qa_id(10),''Synthetic offer'',''Synthetic sufficiently long description'',100)', 'redan skickat', 'duplicate offer rejected');
SELECT pg_temp.expect_error('UPDATE public.offers SET status=''accepted'' WHERE supplier_id=auth.uid()', 'permission denied', 'supplier cannot self accept');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(4)::text, true);
SET LOCAL ROLE authenticated;
SELECT public.unlock_project_for_supplier(pg_temp.qa_id(10));
SELECT set_config('qa.offer_two', public.submit_project_offer(pg_temp.qa_id(10), 'Synthetic offer two', 'Another synthetic offer description.', 25000, 5, 'fixed')::text, true);
SELECT pg_temp.check_ok((SELECT status = 'closed' AND offer_count = 2 FROM public.projects WHERE id = pg_temp.qa_id(10)), 'last slot closes project with exact count and retains supplier access');
SELECT pg_temp.expect_error('SELECT public.decide_project_offer(current_setting(''qa.offer_two'')::uuid,''accepted'')', 'Bara beställaren', 'supplier cannot decide through RPC');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(5)::text, true);
SET LOCAL ROLE authenticated;
SELECT pg_temp.expect_error('SELECT public.unlock_project_for_supplier(pg_temp.qa_id(10))', 'tar inte emot', 'closed project cannot charge a new supplier');
SELECT pg_temp.check_ok((SELECT lead_credits = 3 FROM public.supplier_profiles WHERE id = auth.uid()), 'failed closed unlock preserves credits');
SELECT pg_temp.expect_error('SELECT public.get_buyer_project_offers(pg_temp.qa_id(10))', 'Bara beställaren', 'outsider cannot read competing offers');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(1)::text, true);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok(jsonb_array_length(public.get_buyer_project_offers(pg_temp.qa_id(10))) = 2, 'buyer receives both offers');
SELECT pg_temp.check_ok((public.get_buyer_project_offers(pg_temp.qa_id(10))->0->'profiles'->>'email') IS NULL, 'supplier private contact hidden until accepted');
SELECT pg_temp.check_ok((SELECT count(*) = 1 FROM storage.objects WHERE bucket_id = 'offer-attachments' AND name LIKE pg_temp.qa_id(3)::text || '/%'), 'attachment access scoped to exact submitted file');
SELECT public.decide_project_offer(current_setting('qa.offer_one')::uuid, 'accepted');
SELECT public.decide_project_offer(current_setting('qa.offer_one')::uuid, 'accepted');
SELECT pg_temp.check_ok((SELECT count(*) = 1 FROM public.offers WHERE project_id = pg_temp.qa_id(10) AND status = 'accepted'), 'exactly one accepted winner after retry');
SELECT pg_temp.check_ok((SELECT status = 'declined' FROM public.offers WHERE id = current_setting('qa.offer_two')::uuid), 'other offer declined atomically');
SELECT pg_temp.check_ok(EXISTS(SELECT 1 FROM jsonb_array_elements(public.get_buyer_project_offers(pg_temp.qa_id(10))) o WHERE o->'profiles'->>'email' = 'updro-transaction-qa-3@example.invalid'), 'accepted supplier contact exposed to buyer');
SELECT pg_temp.expect_error('SELECT public.decide_project_offer(current_setting(''qa.offer_two'')::uuid,''accepted'')', 'inte längre', 'cannot replace accepted winner');
SELECT pg_temp.expect_error('SELECT public.close_project_without_offer(pg_temp.qa_id(10))', 'redan accepterad', 'cannot cancel selected offer through close action');
SELECT set_config('qa.agreement', (public.update_project_agreement(current_setting('qa.offer_one')::uuid, 'create')->>'id'), true);
SELECT pg_temp.check_ok((public.update_project_agreement(current_setting('qa.offer_one')::uuid, 'create')->>'id') = current_setting('qa.agreement'), 'agreement creation retry idempotent');
SELECT pg_temp.check_ok(length((public.get_project_agreement(pg_temp.qa_id(10), current_setting('qa.offer_one')::uuid))->'agreement'->'content'->>'scope') > 800, 'agreement preserves complete scope');
SELECT pg_temp.expect_error('UPDATE public.project_agreements SET content=''{}''::jsonb', 'permission denied', 'client cannot forge agreement content or signatures');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(3)::text, true);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok(public.get_project_agreement(pg_temp.qa_id(10), current_setting('qa.offer_one')::uuid)->'agreement'->>'id' = current_setting('qa.agreement'), 'supplier reads agreement on closed project');
SELECT pg_temp.expect_error('SELECT public.update_project_agreement(current_setting(''qa.offer_one'')::uuid,''confirm'',1)', 'Beställaren behöver bekräfta', 'supplier cannot confirm first');
SELECT pg_temp.expect_error('SELECT public.update_project_agreement(current_setting(''qa.offer_one'')::uuid,''edit'',1,''Changed scope'','''')', 'Bara beställaren', 'supplier cannot rewrite buyer draft');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(1)::text, true);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok(public.update_project_agreement(current_setting('qa.offer_one')::uuid, 'confirm', 1)->>'revision' = '2', 'buyer confirmation saves server revision');
SELECT pg_temp.expect_error('SELECT public.update_project_agreement(current_setting(''qa.offer_one'')::uuid,''edit'',2,''Synthetic scope'','''',''{"deliverables":["Page"],"due_date":"2026-02-30","revision_rounds":0,"acceptance_criteria":"Test"}''::jsonb)', 'giltigt leveransdatum', 'invalid delivery date rejected by server');
SELECT pg_temp.expect_error('SELECT public.update_project_agreement(current_setting(''qa.offer_one'')::uuid,''edit'',2,''Synthetic scope'','''',''{"deliverables":["Page"],"due_date":null,"revision_rounds":1.5,"acceptance_criteria":"Test"}''::jsonb)', 'hela korrekturrundor', 'fractional revision rounds rejected by server');
SELECT pg_temp.expect_error('SELECT public.update_project_agreement(current_setting(''qa.offer_one'')::uuid,''edit'',2,''Synthetic scope'','''',''{"deliverables":[42],"due_date":null,"revision_rounds":0,"acceptance_criteria":"Test"}''::jsonb)', 'leverans ska', 'non-text deliverable rejected by server');
SELECT pg_temp.check_ok((SELECT count(*) = 2 FROM public.project_agreement_events WHERE agreement_id = current_setting('qa.agreement')::uuid), 'failed plan edits did not create history or change revision');
SELECT pg_temp.check_ok(public.update_project_agreement(current_setting('qa.offer_one')::uuid, 'edit', 2, (SELECT content->>'scope' FROM public.project_agreements WHERE id=current_setting('qa.agreement')::uuid), '', '{"deliverables":["Five pages","Handover"],"due_date":"2026-10-31","revision_rounds":0,"acceptance_criteria":"All agreed checks pass"}'::jsonb)->'content'->>'buyer_confirmed_at' IS NULL, 'delivery-only change invalidates previous confirmation');
SELECT pg_temp.check_ok((SELECT content->'delivery_plan'->>'revision_rounds' = '0' AND content->'delivery_plan'->>'due_date' = '2026-10-31' AND jsonb_array_length(content->'delivery_plan'->'deliverables') = 2 FROM public.project_agreements WHERE id = current_setting('qa.agreement')::uuid), 'delivery plan saves all fields including zero rounds');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(3)::text, true);
SET LOCAL ROLE authenticated;
SELECT pg_temp.expect_error('SELECT public.update_project_agreement(current_setting(''qa.offer_one'')::uuid,''confirm'',2)', 'Avtalet har ändrats', 'stale displayed agreement cannot be confirmed');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(1)::text, true);
SET LOCAL ROLE authenticated;
SELECT public.update_project_agreement(current_setting('qa.offer_one')::uuid, 'confirm', 3);
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(3)::text, true);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok(public.update_project_agreement(current_setting('qa.offer_one')::uuid, 'confirm', 4)->'content'->>'supplier_confirmed_at' IS NOT NULL, 'supplier confirmation saved');
SELECT pg_temp.check_ok((SELECT count(*) = 5 FROM public.project_agreement_events WHERE agreement_id = current_setting('qa.agreement')::uuid), 'audit history records all versions and actors');
SELECT pg_temp.check_ok((SELECT count(*) = 1 FROM public.notifications WHERE user_id = auth.uid() AND type = 'offer_accepted'), 'retry does not duplicate acceptance notification');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(1)::text, true);
SET LOCAL ROLE authenticated;
SELECT pg_temp.expect_error('SELECT public.update_project_agreement(current_setting(''qa.offer_one'')::uuid,''edit'',5,''Changed after signing'','''')', 'låst', 'both confirmed agreement is immutable');
SELECT pg_temp.check_ok((SELECT content->'delivery_plan'->>'acceptance_criteria' = 'All agreed checks pass' FROM public.project_agreements WHERE id = current_setting('qa.agreement')::uuid), 'both confirmations preserve the agreed delivery plan');
SELECT pg_temp.expect_error('DELETE FROM public.projects WHERE id=pg_temp.qa_id(10)', 'foreign key constraint', 'agreement prevents accidental project deletion');
SELECT pg_temp.expect_error('UPDATE public.projects SET buyer_id=pg_temp.qa_id(2) WHERE id=pg_temp.qa_id(10)', 'beställare kan inte ändras', 'buyer cannot transfer agreement identity');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(5)::text, true);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok((SELECT count(*) = 0 FROM public.project_agreements WHERE id = current_setting('qa.agreement')::uuid), 'unrelated user cannot read agreement');
SELECT pg_temp.check_ok((SELECT count(*) = 0 FROM public.project_agreement_events WHERE agreement_id = current_setting('qa.agreement')::uuid), 'unrelated user cannot read audit history');
SELECT pg_temp.expect_error('SELECT public.update_project_agreement(current_setting(''qa.offer_one'')::uuid,''confirm'',5)', 'bara tillgängligt', 'unrelated user cannot confirm');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(2)::text, true);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok(public.claim_guest_projects() = 0, 'unverified email cannot claim guest request');
RESET ROLE;
UPDATE auth.users SET email_confirmed_at = now() WHERE id = pg_temp.qa_id(2);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok(public.claim_guest_projects() = 1, 'verified buyer claims matching guest project');
SELECT pg_temp.check_ok(public.claim_guest_projects() = 0, 'guest claim retry idempotent');
SELECT pg_temp.check_ok((SELECT buyer_id = auth.uid() AND guest_lead_id IS NULL FROM public.projects WHERE id = pg_temp.qa_id(12)), 'claimed project obeys buyer/guest constraint');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', '', true), set_config('request.jwt.claim.role', 'service_role', true);
SET LOCAL ROLE service_role;
SELECT pg_temp.check_ok(public.apply_stripe_purchase_event('SYNTHETIC-ROLLBACK-QA-MONTHLY', 'checkout.session.completed', pg_temp.qa_id(6), 'monthly', 1190, 'SYNTHETIC-ROLLBACK-QA-SUB'), 'monthly purchase activates supported plan');
SELECT pg_temp.check_ok(NOT public.apply_stripe_purchase_event('SYNTHETIC-ROLLBACK-QA-MONTHLY', 'checkout.session.completed', pg_temp.qa_id(6), 'monthly', 1190, 'SYNTHETIC-ROLLBACK-QA-SUB'), 'payment event retry idempotent');
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(6)::text, true), set_config('request.jwt.claim.role', 'authenticated', true);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok(public.unlock_project_for_supplier(pg_temp.qa_id(11))->>'credits_left' = '3', 'monthly supplier unlocks without credit charge');
SELECT pg_temp.check_ok((SELECT plan = 'monthly' FROM public.supplier_profiles WHERE id = auth.uid()), 'monthly plan persisted');
RESET ROLE;
SELECT count(*) AS passed_checks, jsonb_agg(label) AS checks FROM qa_checks;
ROLLBACK;
