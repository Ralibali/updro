-- Kampanjkoder (grundarbyrå-flöde) + värvningsprogram för byråer
--
-- campaign_codes: endast läsbar/skrivbar via service role (inga RLS-policies
-- skapas => nekad åtkomst för anon/authenticated). Validering sker alltid
-- server-side i create-account.

create table if not exists public.campaign_codes (
  code text primary key,
  trial_days integer not null default 7,
  lead_credits integer not null default 5,
  max_uses integer not null default 30,
  used_count integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.campaign_codes enable row level security;

-- Grundarkoden: 12 månader + 30 leads för de 30 första byråerna
insert into public.campaign_codes (code, trial_days, lead_credits, max_uses)
values ('GRUNDARE', 365, 30, 30)
on conflict (code) do nothing;

-- Värvningsfält på byråprofiler
alter table public.supplier_profiles
  add column if not exists referral_code text,
  add column if not exists referred_by text,
  add column if not exists campaign_code text;

-- Unik värvningskod per byrå (null tillåts, indexet ignorerar null-rader)
create unique index if not exists supplier_profiles_referral_code_key
  on public.supplier_profiles (referral_code)
  where referral_code is not null;

create index if not exists supplier_profiles_referred_by_idx
  on public.supplier_profiles (referred_by)
  where referred_by is not null;

-- Backfill: ge befintliga byråer en deterministisk värvningskod
update public.supplier_profiles
set referral_code = lower(substring(md5(id::text || '-updro-ref') for 8))
where referral_code is null;
