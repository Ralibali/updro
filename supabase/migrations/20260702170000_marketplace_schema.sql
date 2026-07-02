alter table public.supplier_profiles
  add column if not exists f_skatt boolean not null default false,
  add column if not exists company_status text not null default 'unknown',
  add column if not exists verified_level text not null default 'none',
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references auth.users(id);

alter table public.projects
  add column if not exists sla_at_risk boolean not null default false;

create table if not exists public.offer_comparisons (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  result jsonb not null,
  offer_fingerprint text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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

create index if not exists offer_comparisons_project_id_idx on public.offer_comparisons(project_id);
create index if not exists project_agreements_project_id_idx on public.project_agreements(project_id);
create index if not exists projects_sla_at_risk_idx on public.projects(sla_at_risk) where sla_at_risk = true;
