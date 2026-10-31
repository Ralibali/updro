-- Runtime jobs for the offer flow. Run once in production after
-- 20261031120000_marketplace_trust_and_notifications.sql and after deploying
-- send-notification-emails, send-guest-offer-emails and offer-reminder-cron.
--
-- Uses the Vault secret lead_alert_cron_secret, which must match the Edge
-- secret LEAD_ALERT_CRON_SECRET (already used by send-supplier-lead-alerts, see
-- notification-runtime.sql). No secret values are stored here.
--
-- Idempotent: a job is only created when no existing job already calls the
-- function, so an older manually created job is kept and never doubled.
DO $do$
DECLARE
  v_base constant text := 'https://opgjoevvlwhsddscqmpe.supabase.co/functions/v1/';
  v_jobs constant text[][] := ARRAY[
    ARRAY['send-notification-emails', 'send-notification-emails-every-2min', '*/2 * * * *'],
    ARRAY['send-guest-offer-emails', 'send-guest-offer-emails-every-2min', '1-59/2 * * * *'],
    ARRAY['offer-reminder-cron', 'offer-reminder-daily', '7 7 * * *'],
    ARRAY['send-followup-reminders', 'send-followup-reminders-daily', '13 6 * * *']
  ];
  v_job text[];
BEGIN
  IF to_regnamespace('cron') IS NULL OR to_regnamespace('net') IS NULL THEN
    RAISE NOTICE 'pg_cron/pg_net saknas – inga jobb skapades.';
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'lead_alert_cron_secret') THEN
    RAISE EXCEPTION 'Vault-hemligheten lead_alert_cron_secret saknas. Skapa den med samma värde som Edge-hemligheten LEAD_ALERT_CRON_SECRET.';
  END IF;
  FOREACH v_job SLICE 1 IN ARRAY v_jobs LOOP
    IF EXISTS (SELECT 1 FROM cron.job WHERE command ILIKE '%' || v_job[1] || '%') THEN
      RAISE NOTICE 'Jobb för % finns redan – lämnas orört.', v_job[1];
      CONTINUE;
    END IF;
    PERFORM cron.schedule(v_job[2], v_job[3], format($cron$
      SELECT net.http_post(
        url := %L,
        headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret',
          (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'lead_alert_cron_secret' LIMIT 1)),
        body := jsonb_build_object('scheduled_at', now())
      );
    $cron$, v_base || v_job[1]));
    RAISE NOTICE 'Skapade jobb % (%).', v_job[2], v_job[3];
  END LOOP;
END
$do$;

-- Kontroll: alla fyra funktionerna ska synas här, plus send-supplier-lead-alerts.
SELECT jobname, schedule, active FROM cron.job ORDER BY jobname;
