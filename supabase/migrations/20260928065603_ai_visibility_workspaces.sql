-- Agency-owned workspaces; never exposed to marketplace customers.
create table public.ai_visibility_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 160),
  workspace jsonb not null default '{}'::jsonb check (octet_length(workspace::text) <= 1000000),
  revision integer not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.ai_visibility_workspaces enable row level security;
revoke all on public.ai_visibility_workspaces from anon, authenticated;
grant select, insert, update, delete on public.ai_visibility_workspaces to authenticated;
create policy visibility_admin on public.ai_visibility_workspaces for all to authenticated
using (public.is_admin((select auth.uid()))) with check (public.is_admin((select auth.uid())));

create table public.ai_visibility_checks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.ai_visibility_workspaces(id) on delete cascade,
  checked_on date not null default current_date,
  prompt text not null check (length(prompt) between 1 and 500),
  status text not null default 'running' check (status in ('running','complete','failed')),
  result jsonb,
  created_at timestamptz not null default now(),
  unique (workspace_id, checked_on, prompt)
);
alter table public.ai_visibility_checks enable row level security;
revoke all on public.ai_visibility_checks from anon, authenticated;
grant select on public.ai_visibility_checks to authenticated;
grant all on public.ai_visibility_checks to service_role;
create policy visibility_checks_admin on public.ai_visibility_checks for select to authenticated
using (public.is_admin((select auth.uid())));
