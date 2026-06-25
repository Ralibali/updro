-- Promote guest submissions into normal marketplace projects.

begin;

alter table public.projects
  add column if not exists guest_lead_id uuid;

alter table public.projects
  alter column buyer_id drop not null;

create unique index if not exists projects_guest_lead_id_key
  on public.projects (guest_lead_id)
  where guest_lead_id is not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'projects_guest_lead_id_fkey'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_guest_lead_id_fkey
      foreign key (guest_lead_id)
      references public.guest_leads(id)
      on delete set null;
  end if;
end
$$;

create or replace function public.promote_guest_lead_to_project()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  project_id uuid;
begin
  if new.converted_project_id is not null then
    return new;
  end if;

  insert into public.projects (
    buyer_id, guest_lead_id, title, description, category,
    budget_range, start_time, is_company, status, created_at, updated_at
  ) values (
    null, new.id, new.title, new.description, new.category,
    new.budget_range, new.start_time, coalesce(new.is_company, true),
    'active', new.created_at, now()
  )
  on conflict (guest_lead_id) where guest_lead_id is not null
  do update set
    title = excluded.title,
    description = excluded.description,
    category = excluded.category,
    budget_range = excluded.budget_range,
    start_time = excluded.start_time,
    is_company = excluded.is_company,
    updated_at = now()
  returning id into project_id;

  update public.guest_leads
  set status = 'converted',
      converted_project_id = project_id,
      updated_at = now()
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists trg_promote_guest_lead_to_project on public.guest_leads;
create trigger trg_promote_guest_lead_to_project
after insert on public.guest_leads
for each row execute function public.promote_guest_lead_to_project();

-- Recover leads submitted before this fix.
insert into public.projects (
  buyer_id, guest_lead_id, title, description, category,
  budget_range, start_time, is_company, status, created_at, updated_at
)
select
  null, gl.id, gl.title, gl.description, gl.category,
  gl.budget_range, gl.start_time, coalesce(gl.is_company, true),
  'active', gl.created_at, now()
from public.guest_leads gl
where gl.converted_project_id is null
  and gl.status in ('unclaimed', 'pending')
on conflict (guest_lead_id) where guest_lead_id is not null do nothing;

update public.guest_leads gl
set status = 'converted',
    converted_project_id = p.id,
    updated_at = now()
from public.projects p
where p.guest_lead_id = gl.id
  and gl.converted_project_id is distinct from p.id;

commit;
