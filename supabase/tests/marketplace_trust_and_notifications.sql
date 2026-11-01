-- Synthetic checks for 20261031120000_marketplace_trust_and_notifications.
-- Always rolled back; run after migrations. No real users or e-mails: queued
-- rows disappear with the rollback before any mailer or push worker sees them.
-- Safe on a live database: every count is limited to the synthetic fixtures,
-- so real jobs, logs and reminders running at the same time do not matter.
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

-- 1 buyer, 2 other buyer, 3-7 pay-per-lead agencies, 8 admin,
-- 9 monthly-plan agency, 10 agency whose trial has ended.
INSERT INTO auth.users(id, email, email_confirmed_at)
SELECT pg_temp.qa_id(n), 'updro-trust-qa-' || n || '@example.invalid', now() FROM generate_series(1, 10) n;
INSERT INTO public.profiles(id, role, full_name, company_name, email)
SELECT pg_temp.qa_id(n),
  CASE WHEN n <= 2 THEN 'buyer' WHEN n = 8 THEN 'admin' ELSE 'supplier' END,
  'Synthetic person ' || n, CASE WHEN n BETWEEN 3 AND 7 OR n >= 9 THEN 'Synthetic agency ' || n END,
  'updro-trust-qa-' || n || '@example.invalid'
FROM generate_series(1, 10) n;
INSERT INTO public.supplier_profiles(id, slug, plan, lead_credits, lead_alert_emails, trial_ends_at)
SELECT pg_temp.qa_id(n), 'synthetic-trust-qa-' || n,
  CASE n WHEN 9 THEN 'monthly' WHEN 10 THEN 'trial' ELSE 'payg' END,
  CASE n WHEN 9 THEN 0 WHEN 10 THEN 2 ELSE 3 END,
  false,
  CASE WHEN n = 10 THEN now() - interval '1 day' END
FROM generate_series(3, 10) n WHERE n <> 8;
INSERT INTO public.projects(id, buyer_id, title, description, category, status, max_offers)
VALUES
  (pg_temp.qa_id(20), pg_temp.qa_id(1), 'SYNTHETIC SLOT QA', 'Synthetic fixture, never a real project.', 'Webbutveckling', 'active', 2),
  (pg_temp.qa_id(21), pg_temp.qa_id(1), 'SYNTHETIC REFUND QA', 'Synthetic fixture, never a real project.', 'Webbutveckling', 'active', 1),
  (pg_temp.qa_id(22), pg_temp.qa_id(1), 'SYNTHETIC DELETE QA', 'Synthetic fixture, never a real project.', 'Webbutveckling', 'active', 3),
  (pg_temp.qa_id(23), pg_temp.qa_id(1), 'SYNTHETIC CLOSE QA', 'Synthetic fixture, never a real project.', 'Webbutveckling', 'active', 3),
  (pg_temp.qa_id(24), pg_temp.qa_id(1), 'SYNTHETIC FULL CLOSE QA', 'Synthetic fixture, never a real project.', 'Webbutveckling', 'active', 1),
  (pg_temp.qa_id(25), pg_temp.qa_id(2), 'SYNTHETIC PLAN QA', 'Synthetic fixture, never a real project.', 'Webbutveckling', 'active', 3),
  (pg_temp.qa_id(26), pg_temp.qa_id(1), 'SYNTHETIC REMINDER QA', 'Synthetic fixture, never a real project.', 'Webbutveckling', 'active', 3);

-- Offer slots ---------------------------------------------------------------
SELECT pg_temp.act_as(3);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok((public.unlock_project_for_supplier(pg_temp.qa_id(20))->>'credits_left')::int = 2, 'unlock charges exactly one credit');
SELECT pg_temp.check_ok((public.unlock_project_for_supplier(pg_temp.qa_id(20))->>'already_unlocked')::boolean, 'repeat unlock is free');
SELECT pg_temp.check_ok((SELECT lead_credits = 2 FROM public.supplier_profiles WHERE id = auth.uid()), 'repeat unlock kept the balance');
SELECT pg_temp.check_ok((SELECT my_reserved_until > now() + interval '6 days' FROM public.get_project_slot_summary(ARRAY[pg_temp.qa_id(20)])), 'paid unlock holds its slot for seven days');
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
-- Agency B lets its hold run out.
UPDATE public.unlocked_leads SET hold_until = now() - interval '1 second'
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

-- Monthly-plan unlocks are free, so they hold a slot for three days only.
SELECT pg_temp.act_as(9);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok((public.unlock_project_for_supplier(pg_temp.qa_id(25))->>'credits_left')::int = 0, 'monthly unlock is free');
RESET ROLE;
SELECT pg_temp.check_ok((SELECT NOT credit_charged AND hold_until > now() + interval '71 hours' AND hold_until <= now() + interval '3 days'
  FROM public.unlocked_leads WHERE project_id = pg_temp.qa_id(25) AND supplier_id = pg_temp.qa_id(9)), 'free unlock holds its slot for three days');
SELECT pg_temp.act_as(10);
SET LOCAL ROLE authenticated;
SELECT pg_temp.expect_error('SELECT public.unlock_project_for_supplier(pg_temp.qa_id(25))', 'provperiod', 'ended trial cannot unlock with leftover credits');
SELECT pg_temp.check_ok((SELECT lead_credits = 2 FROM public.supplier_profiles WHERE id = auth.uid()), 'ended trial keeps its credits');
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
SELECT pg_temp.expect_error($q$INSERT INTO public.messages(project_id, sender_id, receiver_id, content, is_read)
  VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(1), 'Pre-read message', true)$q$, 'permission denied', 'sender cannot set read state');
SELECT pg_temp.expect_error($q$INSERT INTO public.messages(project_id, sender_id, receiver_id, content, created_at)
  VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(1), 'Pinned message', now() + interval '1 year')$q$, 'permission denied', 'sender cannot set the time');
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
SELECT pg_temp.check_ok((SELECT unread_count = 0 FROM public.get_my_conversations() WHERE other_id = pg_temp.qa_id(3)), 'receiver marks messages read');
SELECT pg_temp.expect_error($q$UPDATE public.messages SET content = 'rewritten' WHERE receiver_id = auth.uid()$q$,
  'permission denied', 'receiver cannot rewrite a message');
UPDATE public.notifications SET is_read = true WHERE user_id = auth.uid() AND type = 'new_message';
SELECT pg_temp.expect_error($q$UPDATE public.notifications SET link = '/elsewhere' WHERE user_id = auth.uid()$q$,
  'permission denied', 'user cannot rewrite a notice');
-- Agency 4 only unlocked: the buyer cannot test that or write first.
SELECT pg_temp.check_ok(public.get_chat_party(pg_temp.qa_id(20), pg_temp.qa_id(4)) IS NULL, 'buyer cannot probe an agency that only unlocked');
SELECT pg_temp.expect_error($q$INSERT INTO public.messages(project_id, sender_id, receiver_id, content)
  VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(4), 'Hej?')$q$, 'row-level security', 'buyer cannot write first to an agency that only unlocked');
RESET ROLE;
SELECT pg_temp.act_as(4);
SET LOCAL ROLE authenticated;
INSERT INTO public.messages(project_id, sender_id, receiver_id, content)
VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(1), 'Hej, vi har en fråga om omfattningen.');
RESET ROLE;
SELECT pg_temp.act_as(1);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok(public.get_chat_party(pg_temp.qa_id(20), pg_temp.qa_id(4))->>'other_name' = 'Synthetic agency 4', 'buyer can answer once the agency wrote');
INSERT INTO public.messages(project_id, sender_id, receiver_id, content)
VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(4), 'Absolut, fråga på.');
RESET ROLE;
SELECT pg_temp.check_ok((SELECT link LIKE '/dashboard/supplier/chatt?project=%' FROM public.notifications
  WHERE user_id = pg_temp.qa_id(4) AND type = 'new_message'), 'agency notice links to the agency chat');
SELECT pg_temp.act_as(3);
SET LOCAL ROLE authenticated;
INSERT INTO public.messages(project_id, sender_id, receiver_id, content)
VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(1), 'En sak till.');
RESET ROLE;
SELECT pg_temp.check_ok((SELECT count(*) = 2 FROM public.notifications WHERE user_id = pg_temp.qa_id(1) AND type = 'new_message'
  AND link LIKE '%&user=' || pg_temp.qa_id(3)), 'a read notice lets the next message notify again');

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

-- Decisions and closing notify agencies that unlocked without answering --------------
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

-- A full project is already closed; closing it still tells the agency that never answered.
SELECT pg_temp.act_as(4);
SET LOCAL ROLE authenticated;
SELECT public.unlock_project_for_supplier(pg_temp.qa_id(24));
RESET ROLE;
UPDATE public.unlocked_leads SET hold_until = now() - interval '1 second'
WHERE project_id = pg_temp.qa_id(24) AND supplier_id = pg_temp.qa_id(4);
SELECT pg_temp.act_as(3);
SET LOCAL ROLE authenticated;
SELECT public.unlock_project_for_supplier(pg_temp.qa_id(24));
SELECT public.submit_project_offer(pg_temp.qa_id(24), 'Synthetic offer D', 'Synthetic offer description, long enough.', 7000);
RESET ROLE;
SELECT pg_temp.check_ok((SELECT status = 'closed' FROM public.projects WHERE id = pg_temp.qa_id(24)), 'single slot filled');
SELECT pg_temp.act_as(1);
SET LOCAL ROLE authenticated;
SELECT public.close_project_without_offer(pg_temp.qa_id(24));
SELECT public.close_project_without_offer(pg_temp.qa_id(24));
RESET ROLE;
SELECT pg_temp.check_ok((SELECT count(*) = 1 FROM public.notifications WHERE user_id = pg_temp.qa_id(4)
  AND type = 'project_closed' AND link = '/dashboard/supplier/uppdrag/' || pg_temp.qa_id(24)), 'closing a full project notifies the silent agency once');

-- Reviews -----------------------------------------------------------------------
SELECT pg_temp.act_as(1);
SET LOCAL ROLE authenticated;
INSERT INTO public.reviews(project_id, buyer_id, supplier_id, rating, comment)
VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(3), 4, 'Synthetic review');
SELECT pg_temp.expect_error($q$INSERT INTO public.reviews(project_id, buyer_id, supplier_id, rating)
  VALUES (pg_temp.qa_id(24), auth.uid(), pg_temp.qa_id(3), 1)$q$, 'row-level security', 'buyer cannot review an offer they did not accept');
RESET ROLE;
SELECT pg_temp.act_as(2);
SET LOCAL ROLE authenticated;
SELECT pg_temp.expect_error($q$INSERT INTO public.reviews(project_id, buyer_id, supplier_id, rating)
  VALUES (pg_temp.qa_id(20), auth.uid(), pg_temp.qa_id(4), 1)$q$, 'row-level security', 'nobody can review on someone else''s project');
RESET ROLE;
SELECT pg_temp.check_ok((SELECT count(*) = 1 AND min(message) LIKE '%betyget fyra av fem%' FROM public.notifications
  WHERE user_id = pg_temp.qa_id(3) AND type = 'new_review'), 'genuine review notifies the agency');
SELECT pg_temp.check_ok(EXISTS (SELECT 1 FROM public.notification_email_queue WHERE user_id = pg_temp.qa_id(3) AND type = 'new_review'),
  'review notice is queued for e-mail');

-- Scheduled notices ----------------------------------------------------------------
-- Agency 7 holds project 22; its hold runs out tomorrow.
SELECT pg_temp.act_as(7);
SET LOCAL ROLE authenticated;
SELECT public.unlock_project_for_supplier(pg_temp.qa_id(22));
RESET ROLE;
UPDATE public.unlocked_leads SET hold_until = now() + interval '1 day'
WHERE project_id = pg_temp.qa_id(22) AND supplier_id = pg_temp.qa_id(7);
SELECT public.notify_expiring_offer_slots();
SELECT public.notify_expiring_offer_slots();
SELECT pg_temp.check_ok((SELECT count(*) = 1 AND min(message) LIKE '%leadgarantin%' FROM public.notifications
  WHERE user_id = pg_temp.qa_id(7) AND type = 'slot_expiring' AND link = '/dashboard/supplier/uppdrag/' || pg_temp.qa_id(22)),
  'agency is warned once before its slot runs out');
SELECT pg_temp.check_ok(NOT EXISTS (SELECT 1 FROM public.notifications WHERE user_id = pg_temp.qa_id(9) AND type = 'slot_expiring'),
  'no warning while plenty of time is left');
SELECT pg_temp.check_ok(EXISTS (SELECT 1 FROM public.notification_email_queue WHERE user_id = pg_temp.qa_id(7) AND type = 'slot_expiring'),
  'slot warning is queued for e-mail');

-- Agency 6 answered project 26 six days ago and the buyer has not decided.
SELECT pg_temp.act_as(6);
SET LOCAL ROLE authenticated;
SELECT public.unlock_project_for_supplier(pg_temp.qa_id(26));
SELECT public.submit_project_offer(pg_temp.qa_id(26), 'Synthetic offer E', 'Synthetic offer description, long enough.', 8000);
RESET ROLE;
UPDATE public.offers SET created_at = now() - interval '6 days' WHERE project_id = pg_temp.qa_id(26);
-- Count only the synthetic buyer's reminders: in production real buyers can be
-- due at the same time (their reminders roll back with the test).
CREATE FUNCTION pg_temp.synthetic_reminders() RETURNS bigint LANGUAGE sql AS $$
  SELECT count(*) FROM public.notifications
  WHERE user_id = pg_temp.qa_id(1) AND type = 'offer_reminder' AND link = '/dashboard/buyer/uppdrag/' || pg_temp.qa_id(26)
$$;
SELECT public.send_offer_decision_reminders();
SELECT pg_temp.check_ok(pg_temp.synthetic_reminders() = 1, 'undecided buyer is reminded');
SELECT public.send_offer_decision_reminders();
SELECT pg_temp.check_ok(pg_temp.synthetic_reminders() = 1, 'at most one reminder every three days');
UPDATE public.notifications SET created_at = now() - interval '4 days' WHERE user_id = pg_temp.qa_id(1) AND type = 'offer_reminder';
SELECT public.send_offer_decision_reminders();
UPDATE public.notifications SET created_at = now() - interval '4 days' WHERE user_id = pg_temp.qa_id(1) AND type = 'offer_reminder';
SELECT public.send_offer_decision_reminders();
UPDATE public.notifications SET created_at = now() - interval '4 days' WHERE user_id = pg_temp.qa_id(1) AND type = 'offer_reminder';
SELECT public.send_offer_decision_reminders();
SELECT pg_temp.check_ok(pg_temp.synthetic_reminders() = 3, 'reminders stop after three');
SELECT pg_temp.check_ok((SELECT min(message) LIKE '%väntar en byrå%' FROM public.notifications
  WHERE user_id = pg_temp.qa_id(1) AND type = 'offer_reminder' AND link = '/dashboard/buyer/uppdrag/' || pg_temp.qa_id(26)), 'reminder says who is waiting');
SELECT pg_temp.check_ok(NOT EXISTS (SELECT 1 FROM public.notifications WHERE type = 'offer_reminder'
  AND link IN ('/dashboard/buyer/uppdrag/' || pg_temp.qa_id(20), '/dashboard/buyer/uppdrag/' || pg_temp.qa_id(24))), 'decided or closed projects get no reminder');

-- Deleting ----------------------------------------------------------------------
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

-- Admin job health --------------------------------------------------------------------
-- Synthetic job names: in production the real jobs log here every few minutes.
INSERT INTO public.edge_function_logs(function_name, status_code, duration_ms, ok, meta)
VALUES ('updro-qa-synthetic-job', 200, 40, true, '{}'), ('updro-qa-synthetic-job', 500, 90, false, '{}');
SELECT pg_temp.act_as(8);
SET LOCAL ROLE authenticated;
SELECT pg_temp.check_ok((SELECT total = 2 AND errors = 1 AND last_run IS NOT NULL
  FROM public.admin_edge_function_summary(now() - interval '1 day', ARRAY['updro-qa-synthetic-job', 'updro-qa-silent-job'])
  WHERE function_name = 'updro-qa-synthetic-job'), 'admin summary counts runs and errors');
SELECT pg_temp.check_ok((SELECT total = 0 AND last_run IS NULL
  FROM public.admin_edge_function_summary(now() - interval '1 day', ARRAY['updro-qa-synthetic-job', 'updro-qa-silent-job'])
  WHERE function_name = 'updro-qa-silent-job'), 'admin summary shows silent jobs');
RESET ROLE;
SELECT pg_temp.act_as(1);
SET LOCAL ROLE authenticated;
SELECT pg_temp.expect_error($q$SELECT * FROM public.admin_edge_function_summary(now() - interval '1 day', ARRAY['updro-qa-synthetic-job'])$q$,
  'administratörer', 'only admins read job health');
RESET ROLE;

-- No legacy second debit ------------------------------------------------------------
SELECT pg_temp.check_ok(NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'debit_credit_before_unlock'), 'no second debit trigger');

SELECT count(*) AS passed_checks, json_agg(label) AS checks FROM qa_checks;
ROLLBACK;
