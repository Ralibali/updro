-- OpenOutreach-compatible review pipeline for Updro's existing prospecting data.
-- The GPL application remains an external worker; this schema stores its public
-- interchange fields and enforces human approval before any lead can be exported.

alter table public.prospecting_campaigns
  add column if not exists source_provider text not null default 'firecrawl'
    check (source_provider in ('firecrawl','openoutreach','manual'));

alter table public.prospecting_campaigns
  drop constraint if exists prospecting_campaigns_result_limit_check;
alter table public.prospecting_campaigns
  add constraint prospecting_campaigns_result_limit_check
  check (result_limit between 1 and 100);

alter table public.prospecting_leads
  add column if not exists source_provider text not null default 'firecrawl'
    check (source_provider in ('firecrawl','openoutreach','manual')),
  add column if not exists provider_lead_id text,
  add column if not exists fit_reason text,
  add column if not exists contact_first_name text,
  add column if not exists contact_last_name text,
  add column if not exists contact_title text,
  add column if not exists contact_email text,
  add column if not exists linkedin_url text,
  add column if not exists qualified_at timestamptz,
  add column if not exists outreach_subject text,
  add column if not exists outreach_body text,
  add column if not exists approval_status text not null default 'not_ready'
    check (approval_status in ('not_ready','draft','approved','changes_requested','cancelled')),
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references auth.users(id) on delete set null,
  add column if not exists export_count integer not null default 0 check (export_count >= 0),
  add column if not exists last_exported_at timestamptz,
  add column if not exists reply_note text;

alter table public.prospecting_leads
  drop constraint if exists prospecting_leads_contact_email_format;
alter table public.prospecting_leads
  add constraint prospecting_leads_contact_email_format
  check (contact_email is null or (
    char_length(contact_email) <= 320
    and contact_email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
  ));

create index if not exists idx_prospecting_leads_approval
  on public.prospecting_leads(approval_status, created_at desc);
create index if not exists idx_prospecting_leads_provider_id
  on public.prospecting_leads(source_provider, provider_lead_id)
  where provider_lead_id is not null;
create index if not exists idx_prospecting_leads_contact_email
  on public.prospecting_leads(lower(contact_email))
  where contact_email is not null;

-- Existing policies already restrict both tables to admins. Explicit grants are
-- repeated because public-schema defaults are no longer guaranteed by Supabase.
grant select, insert, update, delete on public.prospecting_campaigns to authenticated;
grant select, insert, update, delete on public.prospecting_leads to authenticated;
grant all on public.prospecting_campaigns to service_role;
grant all on public.prospecting_leads to service_role;
