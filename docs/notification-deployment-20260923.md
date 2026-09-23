# Notification deployment — 2026-09-23

Applied the trusted-project guard and approval notification queue migrations through Lovable Cloud, in the documented order. All 12 transactional database checks passed and rolled back. New tables have explicit grants and RLS.

Deployed `send-transactional-email`, `send-push` and `send-supplier-lead-alerts`. All reject anonymous calls with HTTP 401. An authorized invocation of the lead queue returned HTTP 200 with zero entries. The cron runs every five minutes, using a dedicated `LEAD_ALERT_CRON_SECRET`; the original `CRON_SECRET` remains supported and unchanged. Runtime SQL is recorded in `supabase/operations/notification-runtime.sql`.

Created the notification push trigger and installed the existing push subscription migration with restricted grants. Confirmed RLS, four owner policies, no anonymous reads, no authenticated TRUNCATE and no authenticated EXECUTE on the internal push trigger.

## Remaining before declaring end-to-end delivery verified

- Configure a matching VAPID key pair: `VAPID_PRIVATE_KEY` only in Edge secrets; `VAPID_PUBLIC_KEY` in Edge secrets and the same public value as frontend `VITE_VAPID_PUBLIC_KEY`. Set `VAPID_SUBJECT` to the actual operator contact. No existing keys or subscriptions were found. The Lovable follow-up was blocked by exhausted workspace credits.
- Rebuild frontend after public-key configuration, deploy push function, verify authorized push returns 200, and test delivery to an explicitly consenting browser.
- Run one isolated approval → queue → sent email test using a user-confirmed owner-controlled test address. Do not alert existing suppliers. No test email has been sent.

Lovable also added missing prospecting fields and generated types during deployment. Those changes are retained in its commit `aaa70d346550568abf44885180ad1612fdb8ba03`; no existing values were removed.
