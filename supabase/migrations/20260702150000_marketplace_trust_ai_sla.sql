-- Marketplace upgrades: verification, AI comparisons, agreements and SLA tracking

alter table public.supplier_profiles
  add column if not exists org_number text,
  add column if not exists f_skatt boolean not null default false,
  add column if not exists company_status text not null default 'unknown',
  add column if not exists verified_level text not null default 'none',
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references auth.users(id);

alter table public.supplier_profiles
  drop constraint if exists supplier_profiles_company_status_check;
alter table public.supplier_profiles
  add constraint supplier_profiles_company_status_check
  check (company_status in ('active', 'inactive', 'unknown'));

alter table public.supplier_profiles
  drop constraint if exists supplier_profiles_verified_level_check;
alter table public.supplier_profiles
  add constraint supplier_profiles_verified_level_check
  check (verified_level in ('none', 'basic', 'verified', 'premium'));

-- Existing suppliers keep access while they are manually reviewed. New suppliers start at none.
update public.supplier_profiles
set verified_level = case when coalesce(is_verified, false) then 'verified' else 'basic' end
where verified_level = 'none';

alter table public.projects
  add column if not exists sla_at_risk boolean not null default false;

create table if not exists public.offer_comparisons (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  result jsonb not null,
  offer_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.offer_comparisons enable row level security;

drop policy if exists "Project owners can read offer comparisons" on public.offer_comparisons;
create policy "Project owners can read offer comparisons"
on public.offer_comparisons for select
to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = offer_comparisons.project_id
      and p.buyer_id = auth.uid()
  )
);

create table if not exists public.project_agreements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  content jsonb not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, offer_id)
);

alter table public.project_agreements enable row level security;

drop policy if exists "Agreement parties can read" on public.project_agreements;
create policy "Agreement parties can read"
on public.project_agreements for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    join public.offers o on o.id = project_agreements.offer_id and o.project_id = p.id
    where p.id = project_agreements.project_id
      and (p.buyer_id = auth.uid() or o.supplier_id = auth.uid())
  )
);

-- Defence in depth: unverified suppliers cannot unlock leads even if the UI is bypassed.
create or replace function public.enforce_verified_supplier_unlock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_level text;
begin
  select verified_level into v_level
  from public.supplier_profiles
  where id = new.supplier_id;

  if coalesce(v_level, 'none') = 'none' then
    raise exception 'Byråprofilen måste verifieras innan leads kan låsas upp.';
  end if;

  return new;
end;
$$;

drop trigger if exists verify_supplier_before_unlock on public.unlocked_leads;
create trigger verify_supplier_before_unlock
before insert on public.unlocked_leads
for each row execute function public.enforce_verified_supplier_unlock();

create index if not exists offer_comparisons_project_id_idx on public.offer_comparisons(project_id);
create index if not exists project_agreements_project_id_idx on public.project_agreements(project_id);
create index if not exists project_agreements_offer_id_idx on public.project_agreements(offer_id);
create index if not exists supplier_profiles_verified_level_idx on public.supplier_profiles(verified_level);
create index if not exists projects_sla_at_risk_idx on public.projects(sla_at_risk) where sla_at_risk = true;
