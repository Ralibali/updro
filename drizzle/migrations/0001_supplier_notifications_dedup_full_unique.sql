-- Replace the partial unique index on supplier_notifications.dedup_key with a regular
-- unique index. PostgREST upserts (ON CONFLICT (dedup_key) DO NOTHING) cannot target a
-- partial unique index because they cannot repeat the WHERE predicate, so the followup
-- reminder cron failed with 42P10 whenever any follow-up was overdue. A regular unique
-- index still allows multiple NULLs, so trigger-created rows are unaffected.

DROP INDEX IF EXISTS public.supplier_notifications_dedup_key_key;

CREATE UNIQUE INDEX supplier_notifications_dedup_key_key
  ON public.supplier_notifications(dedup_key);