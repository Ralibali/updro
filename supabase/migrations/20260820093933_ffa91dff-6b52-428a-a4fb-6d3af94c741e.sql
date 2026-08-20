create table if not exists public.campaign_codes (
  code text primary key,
  trial_days integer not null default 7,
  lead_credits integer not null default 5,
  max_uses integer not null default 30,
  used_count integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

grant all on public.campaign_codes to service_role;

alter table public.campaign_codes enable row level security;

insert into public.campaign_codes (code, trial_days, lead_credits, max_uses)
values ('GRUNDARE', 365, 30, 30)
on conflict (code) do nothing;

alter table public.supplier_profiles
  add column if not exists referral_code text,
  add column if not exists referred_by text,
  add column if not exists campaign_code text;

create unique index if not exists supplier_profiles_referral_code_key
  on public.supplier_profiles (referral_code)
  where referral_code is not null;

create index if not exists supplier_profiles_referred_by_idx
  on public.supplier_profiles (referred_by)
  where referred_by is not null;

update public.supplier_profiles
set referral_code = lower(substring(md5(id::text || '-updro-ref') for 8))
where referral_code is null;