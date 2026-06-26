alter table public.projects
  add column if not exists lead_score integer not null default 0,
  add column if not exists email_verified boolean not null default false,
  add column if not exists phone_verified boolean not null default false,
  add column if not exists budget_verified boolean not null default false,
  add column if not exists brief_verified boolean not null default false,
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references public.profiles(id) on delete set null,
  add column if not exists verification_note text;

alter table public.projects drop constraint if exists projects_lead_score_range;
alter table public.projects
  add constraint projects_lead_score_range check (lead_score between 0 and 100) not valid;
alter table public.projects validate constraint projects_lead_score_range;

create or replace function public.calculate_project_lead_score()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_score integer := 0;
  v_length integer := length(trim(coalesce(new.description, '')));
begin
  if v_length >= 500 then
    v_score := v_score + 30;
  elsif v_length >= 220 then
    v_score := v_score + 20;
  elsif v_length >= 80 then
    v_score := v_score + 10;
  end if;

  if new.budget_range is not null and new.budget_range <> 'unknown' then
    v_score := v_score + 15;
  end if;

  if new.start_time in ('asap', 'within_month') then
    v_score := v_score + 15;
  elsif new.start_time is not null then
    v_score := v_score + 8;
  end if;

  if coalesce(new.is_company, false) then
    v_score := v_score + 10;
  end if;

  if coalesce(new.email_verified, false) then
    v_score := v_score + 10;
  end if;

  if coalesce(new.phone_verified, false) then
    v_score := v_score + 10;
  end if;

  if coalesce(new.budget_verified, false) then
    v_score := v_score + 5;
  end if;

  if coalesce(new.brief_verified, false) then
    v_score := v_score + 5;
  end if;

  new.lead_score := least(v_score, 100);
  return new;
end;
$$;

drop trigger if exists calculate_project_lead_score on public.projects;
create trigger calculate_project_lead_score
before insert or update of description, budget_range, start_time, is_company,
  email_verified, phone_verified, budget_verified, brief_verified
on public.projects
for each row execute function public.calculate_project_lead_score();

update public.projects
set description = description;

create or replace function public.verify_project_lead(
  p_project_id uuid,
  p_email_verified boolean,
  p_phone_verified boolean,
  p_budget_verified boolean,
  p_brief_verified boolean,
  p_verification_note text default null,
  p_activate boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_project public.projects%rowtype;
begin
  if v_admin_id is null or not public.is_admin(v_admin_id) then
    raise exception 'Endast administratörer kan verifiera uppdrag.';
  end if;

  update public.projects
  set email_verified = coalesce(p_email_verified, false),
      phone_verified = coalesce(p_phone_verified, false),
      budget_verified = coalesce(p_budget_verified, false),
      brief_verified = coalesce(p_brief_verified, false),
      verified_at = now(),
      verified_by = v_admin_id,
      verification_note = nullif(left(trim(coalesce(p_verification_note, '')), 1500), ''),
      status = case when p_activate then 'active' else status end,
      max_offers = coalesce(max_offers, 3),
      updated_at = now()
  where id = p_project_id
  returning * into v_project;

  if not found then
    raise exception 'Uppdraget finns inte.';
  end if;

  insert into public.audit_log (admin_id, action, target_type, target_id, details)
  values (
    v_admin_id,
    'verify_project_lead',
    'project',
    p_project_id,
    jsonb_build_object(
      'lead_score', v_project.lead_score,
      'email_verified', v_project.email_verified,
      'phone_verified', v_project.phone_verified,
      'budget_verified', v_project.budget_verified,
      'brief_verified', v_project.brief_verified,
      'activated', p_activate
    )
  );

  return jsonb_build_object(
    'id', v_project.id,
    'lead_score', v_project.lead_score,
    'status', v_project.status,
    'verified_at', v_project.verified_at
  );
end;
$$;

revoke all on function public.verify_project_lead(uuid, boolean, boolean, boolean, boolean, text, boolean) from public;
grant execute on function public.verify_project_lead(uuid, boolean, boolean, boolean, boolean, text, boolean) to authenticated;
