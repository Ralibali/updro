-- Lightweight commercial layer for the existing admin-only prospecting flow.
-- The current status column remains the pipeline stage; these fields only add
-- follow-up planning and an optional estimated opportunity value.

alter table public.prospecting_leads
  add column if not exists next_action text,
  add column if not exists next_action_at timestamptz,
  add column if not exists deal_value_sek integer;

alter table public.prospecting_leads
  drop constraint if exists prospecting_leads_deal_value_sek_check;
alter table public.prospecting_leads
  add constraint prospecting_leads_deal_value_sek_check
  check (deal_value_sek is null or deal_value_sek between 0 and 100000000);

create index if not exists idx_prospecting_leads_follow_up
  on public.prospecting_leads(next_action_at, status)
  where next_action_at is not null
    and status not in ('converted', 'rejected', 'do_not_contact');

comment on column public.prospecting_leads.next_action is
  'Admin-entered next commercial action. No automated outreach is triggered.';
comment on column public.prospecting_leads.next_action_at is
  'Optional admin follow-up time for the next commercial action.';
comment on column public.prospecting_leads.deal_value_sek is
  'Optional admin estimate of opportunity value in whole SEK.';
