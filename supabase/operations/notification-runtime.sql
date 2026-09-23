-- Applied to production 2026-09-23. Requires the two named Vault secrets
-- to match the Edge secrets PUSH_WEBHOOK_SECRET / LEAD_ALERT_CRON_SECRET.
-- No secret values are stored in this script. Idempotent trigger and cron setup.
BEGIN;
CREATE OR REPLACE FUNCTION public.send_push_on_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_secret text;
BEGIN
  SELECT decrypted_secret INTO v_secret FROM vault.decrypted_secrets
    WHERE name = 'push_webhook_secret' LIMIT 1;
  IF v_secret IS NULL THEN RETURN NEW; END IF;
  PERFORM net.http_post(
    url := 'https://opgjoevvlwhsddscqmpe.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object('Content-Type','application/json','x-webhook-secret',v_secret),
    body := jsonb_build_object('type','INSERT','record',to_jsonb(NEW))
  );
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.send_push_on_notification() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS send_push_on_notification_insert ON public.notifications;
CREATE TRIGGER send_push_on_notification_insert AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.send_push_on_notification();
SELECT cron.schedule('send-supplier-lead-alerts-every-5min','*/5 * * * *', $cron$
  SELECT net.http_post(
    url := 'https://opgjoevvlwhsddscqmpe.supabase.co/functions/v1/send-supplier-lead-alerts',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret',
      (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='lead_alert_cron_secret' LIMIT 1)),
    body := jsonb_build_object('scheduled_at',now())
  );
$cron$);
COMMIT;
