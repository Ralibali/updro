-- Synthetic checks for 20261031120000_marketplace_trust_and_notifications.
-- Always rolled back; run after migrations. No real users or e-mails: queued
-- rows disappear with the rollback before any mailer or push worker sees them.
BEGIN;
CREATE FUNCTION pg_temp.qa_id(n integer) RETURNS uuid LANGUAGE sql IMMUTABLE AS $$
  SELECT ('d70c0000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid;
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
CREATE FUNCTION pg_temp.act_as(n integer) RETURNS void LANGUAGE sql AS $$
  SELECT set_config('request.jwt.claim.sub', pg_temp.qa_id(n)::text, true),
         set_config('request.jwt.claim.role', 'authenticated', true);
$$;

-- 1 buyer, 2 other buyer, 3-7 agencies (A-E), 8 admin.
INSERT INTO auth.users(id, email, email_confirmed_at)
SELECT pg_temp.qa_id(n), 'updro-trust-qa-' || n || '@example.invalid', now() FROM generate_series(1, 8) n;
INSERT INTO public.profiles(id, role, full_name, company_name, email)
SELECT pg_temp.qa_id(n),
  CASE WHEN n <= 2 THEN 'buyer' WHEN n = 8 THEN 'admin' ELSE 'supplier' END,
  'Synthetic person ' || n, CASE WHEN n BETWEEN 3 AND 7 THEN 'Synthetic agency ' || n END,
  'updro-trust-qa-' || n || '@example.invalid'
FROM generate_series(1, 8) n;
INSERT INTO public.supplier_profiles(id, slug, plan, lead_credits, lead_alert_emails)
SELECT pg_temp.qa_id(n), 'synthetic-trust-qa-' || n, 'payg', 3, false FROM generate_series(3, 7) n;
INSERT INTO public.projects(id, buyer_id, title, description, category, status, max_offers)
VALUES
  (pg_temp.qa_id(20), pg_temp.qa_id(1), 'SYNTHETIC SLOT QA', 'Synthetic fixture, never a real project.', 'Webbutveckling', 'active', 2),
  (pg_temp.qa_id(21), pg_temp.qa_id(1), 'SYNTHETIC REFUND QA', 'Synthetic fixture, never a real project.', 'Webbutveckling', 'active', 1),
  (pg_temp.qa_id(22), pg_temp.qa_id(1), 'SYNTHETIC DELETE QA', 'Synthetic fixture, never a real project.', 'Webbutveckling', 'active', 3),
  (pg_temp.qa_id(23), pg_temp.qa_id(1), 'SYNTHETIC CLOSE QA', 'Synthetic fixture, never a real project.', 'Webbutveckling', 'active', 3);

-- Offer slots ---------------------------------------------------------------
SELECT pg_temp.act_as(3);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok((public.unlock_project_for_supplier(pg_temp.qa_id(20))->>'credits_left')::int = 2, 'unlock charges exactly one credit');
SELECT pg_temp.check_ok((public.unlock_project_for_supplier(pg_temp.qa_id(20))->>'already_unlocked')::boolean, 'repeat unlock is free');
SELECT pg_temp.check_ok((SELECT lead_credits = 2 FROM public.supplier_profiles WHERE id = auth.uid()), 'repeat unlock kept the balance');
SELECT pg_temp.check_ok((SELECT my_reserved_until > now() + interval '6 days' FROM public.get_project_slot_summary(ARRAY[pg_temp.qa_id(20)])), 'holder sees reservation end');
RESET ROLE;
SELECT pg_temp.act_as(4);
SET LOCAL ROLE authenticated;
SELECT public.unlock_project_for_supplier(pg_temp.qa_id(20));
RESET ROLE;
SELECT pg_temp.act_as(5);
SET LOCAL ROLE authenticated;
SELECT pg_temp.expect_error('SELECT public.unlock_project_for_supplier(pg_temp.qa_id(20))', 'reserverade', 'third agency cannot unlock two held slots');
SELECT pg_temp.check_ok((SELECT lead_credits = 3 FROM public.supplier_profiles WHERE id = auth.uid()), 'refused unlock keeps credits');
SELECT pg_temp.check_ok((SELECT slots_taken = 2 AND offer_count = 0 AND max_offers = 2 AND my_reserved_until IS NULL
  FROM public.get_project_slot_summary(ARRAY[pg_temp.qa_id(20)])), 'slot summary counts holds for others');
RESET ROLE;
SELECT pg_temp.act_as(3);
SET LOCAL ROLE authenticated;
SELECT public.submit_project_offer(pg_temp.qa_id(20), 'Synthetic offer A', 'Synthetic offer description, long enough.', 5000);
RESET ROLE;
-- Agency B lets its hold expire.
UPDATE public.unlocked_leads SET created_at = now() - interval '8 days'
WHERE project_id = pg_temp.qa_id(20) AND supplier_id = pg_temp.qa_id(4);
SELECT pg_temp.act_as(5);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok((public.unlock_project_for_supplier(pg_temp.qa_id(20))->>'already_unlocked')::boolean = false, 'expired hold frees the slot');
RESET ROLE;
SELECT pg_temp.act_as(4);
SET LOCAL ROLE authenticated;
SELECT pg_temp.expect_error('SELECT public.submit_project_offer(pg_temp.qa_id(20), ''Synthetic offer B'', ''Synthetic offer description, long enough.'', 5000)',
  'har gått ut', 'expired holder cannot take a reserved slot');
RESET ROLE;
SELECT pg_temp.act_as(5);
SET LOCAL ROLE authenticated;
SELECT public.submit_project_offer(pg_temp.qa_id(20), 'Synthetic offer C', 'Synthetic offer description, long enough.', 6000);
SELECT pg_temp.check_ok((SELECT status = 'closed' AND offer_count = 2 FROM public.projects WHERE id = pg_temp.qa_id(20)), 'last slot still closes the project');
RESET ROLE;

-- An approved lead-guarantee refund frees the slot.
SELECT pg_temp.act_as(6);
SET LOCAL ROLE authenticated;
SELECT public.unlock_project_for_supplier(pg_temp.qa_id(21));
RESET ROLE;
SELECT pg_temp.act_as(7);
SET LOCAL ROLE authenticated;
SELECT pg_temp.expect_error('SELECT public.unlock_project_for_supplier(pg_temp.qa_id(21))', 'reserverade', 'single slot is held');
RESET ROLE;
INSERT INTO public.lead_refund_requests(supplier_id, project_id, unlocked_lead_id, reason, status, credit_refunded)
SELECT supplier_id, project_id, id, 'wrong_scope', 'approved', true FROM public.unlocked_leads
WHERE project_id = pg_temp.qa_id(21) AND supplier_id = pg_temp.qa_id(6);
SELECT pg_temp.act_as(7);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok((public.unlock_project_for_supplier(pg_temp.qa_id(21))->>'already_unlocked')::boolean = false, 'approved refund frees the slot');
RESET ROLE;

-- Chat ------------------------------------------------------------------------
SELECT pg_temp.act_as(6);
SET LOCAL ROLE authenticated;
SELECT pg_temp.expect_error($q$INSERT INTO public.messages(project_id, sender_id, receiver_id, content)
  VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(1), 'Pay-free contact attempt')$q$, 'row-level security', 'agency without unlock cannot message the buyer');
SELECT pg_temp.check_ok(public.get_chat_party(pg_temp.qa_id(20), pg_temp.qa_id(1)) IS NULL, 'outsider gets no chat party');
SELECT pg_temp.check_ok(public.is_project_chat_pair(pg_temp.qa_id(20), pg_temp.qa_id(1), pg_temp.qa_id(3)) = false, 'cannot probe competitors through pair check');
RESET ROLE;
SELECT pg_temp.act_as(2);
SET LOCAL ROLE authenticated;
SELECT pg_temp.expect_error($q$INSERT INTO public.messages(project_id, sender_id, receiver_id, content)
  VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(1), 'Unrelated buyer')$q$, 'row-level security', 'unrelated user cannot message the buyer');
RESET ROLE;
SELECT pg_temp.act_as(3);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok(public.get_chat_party(pg_temp.qa_id(20), pg_temp.qa_id(1))->>'other_name' = 'Synthetic person 1', 'agency sees the buyer name');
INSERT INTO public.messages(project_id, sender_id, receiver_id, content)
VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(1), 'Hej! Har ni en deadline?');
INSERT INTO public.messages(project_id, sender_id, receiver_id, content)
VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(1), 'Vi kan börja nästa vecka.');
SELECT pg_temp.expect_error($q$INSERT INTO public.messages(project_id, sender_id, receiver_id, content)
  VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(1), repeat('x', 5001))$q$, 'messages_content_length', 'overlong message rejected');
SELECT pg_temp.expect_error($q$INSERT INTO public.messages(project_id, sender_id, receiver_id, content)
  VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(1), '   ')$q$, 'messages_content_length', 'blank message rejected');
RESET ROLE;
SELECT pg_temp.check_ok((SELECT count(*) = 1 FROM public.notifications WHERE user_id = pg_temp.qa_id(1) AND type = 'new_message'),
  'two quick messages create one unread notice');
SELECT pg_temp.check_ok((SELECT link = '/dashboard/buyer/chatt?project=' || pg_temp.qa_id(20) || '&user=' || pg_temp.qa_id(3)
  AND title = 'Nytt meddelande från Synthetic agency 3'
  FROM public.notifications WHERE user_id = pg_temp.qa_id(1) AND type = 'new_message'), 'notice deep-links to the conversation');
SELECT pg_temp.check_ok((SELECT q.send_after > now() + interval '9 minutes' FROM public.notification_email_queue q
  JOIN public.notifications n ON n.id = q.notification_id WHERE n.user_id = pg_temp.qa_id(1) AND n.type = 'new_message'),
  'chat e-mail waits so an in-app read can cancel it');
SELECT pg_temp.act_as(1);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok((SELECT count(*) = 1 FROM public.get_my_conversations()), 'buyer conversation list');
SELECT pg_temp.check_ok((SELECT other_name = 'Synthetic agency 3' AND unread_count = 2 AND last_from_me = false
  FROM public.get_my_conversations() WHERE other_id = pg_temp.qa_id(3)), 'conversation shows agency name and unread count');
UPDATE public.messages SET is_read = true WHERE receiver_id = auth.uid() AND sender_id = pg_temp.qa_id(3);
SELECT pg_temp.expect_error($q$UPDATE public.messages SET content = 'rewritten' WHERE receiver_id = auth.uid()$q$,
  'permission denied', 'receiver cannot rewrite a message');
UPDATE public.notifications SET is_read = true WHERE user_id = auth.uid() AND type = 'new_message';
-- The buyer can also start a conversation with an agency that only unlocked.
SELECT pg_temp.check_ok(public.get_chat_party(pg_temp.qa_id(20), pg_temp.qa_id(4)) IS NOT NULL, 'buyer may contact an unlocking agency');
INSERT INTO public.messages(project_id, sender_id, receiver_id, content)
VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(4), 'Hej, är ni fortfarande intresserade?');
RESET ROLE;
SELECT pg_temp.check_ok((SELECT link LIKE '/dashboard/supplier/chatt?project=%' FROM public.notifications
  WHERE user_id = pg_temp.qa_id(4) AND type = 'new_message'), 'agency notice links to the agency chat');
SELECT pg_temp.act_as(3);
SET LOCAL ROLE authenticated;
INSERT INTO public.messages(project_id, sender_id, receiver_id, content)
VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(1), 'En sak till.');
RESET ROLE;
SELECT pg_temp.check_ok((SELECT count(*) = 2 FROM public.notifications WHERE user_id = pg_temp.qa_id(1) AND type = 'new_message'),
  'a read notice lets the next message notify again');

-- E-mail queue ------------------------------------------------------------------
SELECT pg_temp.check_ok((SELECT count(*) = 2 FROM public.notification_email_queue q
  JOIN public.notifications n ON n.id = q.notification_id
  WHERE n.user_id = pg_temp.qa_id(1) AND n.type = 'new_offer' AND q.send_after <= now()), 'offer notices are queued for e-mail at once');
INSERT INTO public.notifications(user_id, type, title) VALUES
  (pg_temp.qa_id(3), 'offer_followup_due', 'Synthetic internal reminder'),
  (pg_temp.qa_id(3), 'new_matching_lead', 'Synthetic lead alert');
SELECT pg_temp.check_ok(NOT EXISTS (SELECT 1 FROM public.notification_email_queue q
  JOIN public.notifications n ON n.id = q.notification_id
  WHERE n.user_id = pg_temp.qa_id(3) AND n.type IN ('offer_followup_due', 'new_matching_lead')), 'internal and lead-alert notices are not double e-mailed');
SELECT pg_temp.act_as(1);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok((SELECT count(*) = 0 FROM public.notification_email_queue), 'buyer cannot read the e-mail queue');
SELECT pg_temp.expect_error($q$INSERT INTO public.notification_email_queue(notification_id, user_id, type)
  SELECT id, user_id, type FROM public.notifications WHERE user_id = auth.uid() LIMIT 1$q$, 'permission denied', 'buyer cannot queue e-mails');
RESET ROLE;
SELECT pg_temp.check_ok((SELECT pg_get_constraintdef(oid) LIKE '%sending%' FROM pg_constraint
  WHERE conname = 'guest_offer_email_queue_status_check'), 'guest mailer may claim rows');

-- Decisions notify agencies that unlocked without answering ----------------------
SELECT pg_temp.act_as(1);
SET LOCAL ROLE authenticated;
SELECT public.decide_project_offer((SELECT id FROM public.offers WHERE project_id = pg_temp.qa_id(20) AND supplier_id = pg_temp.qa_id(3)), 'accepted');
RESET ROLE;
SELECT pg_temp.check_ok((SELECT count(*) = 1 FROM public.notifications WHERE user_id = pg_temp.qa_id(4)
  AND type = 'project_closed' AND title = 'Uppdraget har tilldelats en byrå'), 'unlocked agency hears the project was awarded');
SELECT pg_temp.check_ok((SELECT count(*) = 1 FROM public.notifications WHERE user_id = pg_temp.qa_id(5)
  AND type = 'offer_declined'), 'competing offer declined once');

SELECT pg_temp.act_as(6);
SET LOCAL ROLE authenticated;
SELECT public.unlock_project_for_supplier(pg_temp.qa_id(23));
RESET ROLE;
SELECT pg_temp.act_as(1);
SET LOCAL ROLE authenticated;
SELECT public.close_project_without_offer(pg_temp.qa_id(23));
SELECT public.close_project_without_offer(pg_temp.qa_id(23));
RESET ROLE;
SELECT pg_temp.check_ok((SELECT count(*) = 1 FROM public.notifications WHERE user_id = pg_temp.qa_id(6)
  AND type = 'project_closed' AND link = '/dashboard/supplier/uppdrag/' || pg_temp.qa_id(23)), 'closing notifies unlocked agency exactly once');

-- Deleting ----------------------------------------------------------------------
SELECT pg_temp.act_as(7);
SET LOCAL ROLE authenticated;
SELECT public.unlock_project_for_supplier(pg_temp.qa_id(22));
RESET ROLE;
SELECT pg_temp.act_as(1);
SET LOCAL ROLE authenticated;
SELECT pg_temp.expect_error('DELETE FROM public.projects WHERE id = pg_temp.qa_id(22)', 'kan inte raderas', 'buyer cannot delete a paid-for project');
INSERT INTO public.projects(buyer_id, title, description, category) VALUES
  (auth.uid(), 'SYNTHETIC EMPTY QA', 'Synthetic fixture, never a real project.', 'Webbutveckling');
DELETE FROM public.projects WHERE title = 'SYNTHETIC EMPTY QA' AND buyer_id = auth.uid();
SELECT pg_temp.check_ok(NOT EXISTS (SELECT 1 FROM public.projects WHERE title = 'SYNTHETIC EMPTY QA'), 'buyer still deletes a project nobody touched');
RESET ROLE;
SELECT pg_temp.check_ok((SELECT count(*) = 1 FROM public.unlocked_leads WHERE project_id = pg_temp.qa_id(22)), 'refused delete keeps the paid unlock');
SELECT pg_temp.act_as(8);
SET LOCAL ROLE authenticated;
DELETE FROM public.projects WHERE id = pg_temp.qa_id(22);
SELECT pg_temp.check_ok(NOT EXISTS (SELECT 1 FROM public.projects WHERE id = pg_temp.qa_id(22)), 'admin can still remove a project');
RESET ROLE;

-- No legacy second debit ------------------------------------------------------------
SELECT pg_temp.check_ok(NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'debit_credit_before_unlock'), 'no second debit trigger');

SELECT count(*) AS passed_checks, json_agg(label) AS checks FROM qa_checks;
ROLLBACK;
