-- Idempotent internal reminders: a dedup key per offer and calendar day so the
-- follow-up reminder cron can never create the same notice twice.

alter table public.supplier_notifications
  add column if not exists dedup_key text;

create unique index if not exists supplier_notifications_dedup_key_key
  on public.supplier_notifications(dedup_key)
  where dedup_key is not null;

comment on column public.supplier_notifications.dedup_key is
  'Idempotency key set by server-side jobs (e.g. followup:<offer_id>:<date>). Null for trigger-created rows.';