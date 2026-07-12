-- Idempotent apply of missing parts from 20260626224500_three_offer_lead_guarantee.sql

alter table public.unlocked_leads
  add column if not exists credit_charged boolean not null default true;

update public.unlocked_leads unlocked
set credit_charged = coalesce(profile.plan, 'none') <> 'monthly'
from public.supplier_profiles profile
where profile.id = unlocked.supplier_id
  and unlocked.credit_charged is distinct from (coalesce(profile.plan, 'none') <> 'monthly');

create table if not exists public.lead_refund_requests (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  unlocked_lead_id uuid not null references public.unlocked_leads(id) on delete cascade,
  reason text not null check (reason in (
    'invalid_contact','no_response','fake_lead','duplicate','wrong_scope','other'
  )),
  details text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  credit_refunded boolean not null default false,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (supplier_id, project_id)
);

grant select on public.lead_refund_requests to authenticated;
grant all on public.lead_refund_requests to service_role;

create index if not exists lead_refund_requests_status_created_idx
  on public.lead_refund_requests (status, created_at desc);

alter table public.lead_refund_requests enable row level security;

drop policy if exists "Suppliers read own lead refund requests" on public.lead_refund_requests;
create policy "Suppliers read own lead refund requests"
on public.lead_refund_requests for select to authenticated
using (supplier_id = auth.uid());

drop policy if exists "Admins read lead refund requests" on public.lead_refund_requests;
create policy "Admins read lead refund requests"
on public.lead_refund_requests for select to authenticated
using (public.is_admin(auth.uid()));

create or replace function public.request_lead_refund(
  p_project_id uuid,
  p_reason text,
  p_details text default null
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_unlock public.unlocked_leads%rowtype;
  v_request_id uuid;
begin
  if v_user_id is null then raise exception 'Du måste vara inloggad.'; end if;
  if p_reason not in ('invalid_contact','no_response','fake_lead','duplicate','wrong_scope','other') then
    raise exception 'Välj en giltig anledning.';
  end if;
  select * into v_unlock from public.unlocked_leads
    where supplier_id = v_user_id and project_id = p_project_id;
  if not found then raise exception 'Du måste ha låst upp uppdraget för att använda leadgarantin.'; end if;
  if coalesce(v_unlock.created_at, now()) < now() - interval '7 days' then
    raise exception 'Leadgarantin gäller i sju dagar från upplåsningen.';
  end if;
  if p_reason = 'no_response' and coalesce(v_unlock.created_at, now()) > now() - interval '48 hours' then
    raise exception 'Vänta minst 48 timmar innan du anmäler att kunden inte svarar.';
  end if;
  insert into public.lead_refund_requests (supplier_id, project_id, unlocked_lead_id, reason, details)
  values (v_user_id, p_project_id, v_unlock.id, p_reason,
          nullif(left(trim(coalesce(p_details, '')), 1500), ''))
  returning id into v_request_id;
  return v_request_id;
exception when unique_violation then
  raise exception 'Du har redan skickat en garantiansökan för detta uppdrag.';
end; $$;

revoke all on function public.request_lead_refund(uuid, text, text) from public;
grant execute on function public.request_lead_refund(uuid, text, text) to authenticated;

create or replace function public.review_lead_refund_request(
  p_request_id uuid,
  p_decision text,
  p_admin_note text default null
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_request public.lead_refund_requests%rowtype;
  v_unlock public.unlocked_leads%rowtype;
  v_refunded boolean := false;
begin
  if v_admin_id is null or not public.is_admin(v_admin_id) then
    raise exception 'Endast administratörer kan granska leadgarantin.';
  end if;
  if p_decision not in ('approved','rejected') then raise exception 'Ogiltigt beslut.'; end if;
  select * into v_request from public.lead_refund_requests where id = p_request_id for update;
  if not found then raise exception 'Garantiansökan finns inte.'; end if;
  if v_request.status <> 'pending' then raise exception 'Garantiansökan är redan behandlad.'; end if;
  select * into v_unlock from public.unlocked_leads where id = v_request.unlocked_lead_id for update;
  if p_decision = 'approved' and coalesce(v_unlock.credit_charged, true) then
    update public.supplier_profiles
    set lead_credits = coalesce(lead_credits, 0) + 1,
        trial_leads_used = case
          when coalesce(v_unlock.used_trial_credit, false)
            then greatest(coalesce(trial_leads_used, 0) - 1, 0)
          else trial_leads_used
        end
    where id = v_request.supplier_id;
    v_refunded := true;
  end if;
  update public.lead_refund_requests
  set status = p_decision, credit_refunded = v_refunded,
      reviewed_by = v_admin_id, reviewed_at = now(),
      admin_note = nullif(left(trim(coalesce(p_admin_note, '')), 1500), ''),
      updated_at = now()
  where id = p_request_id;
  insert into public.audit_log (admin_id, action, target_type, target_id, details)
  values (v_admin_id, 'review_lead_refund', 'lead_refund_request', p_request_id,
    jsonb_build_object('decision', p_decision, 'supplier_id', v_request.supplier_id,
      'project_id', v_request.project_id, 'credit_refunded', v_refunded));
  return jsonb_build_object('status', p_decision, 'credit_refunded', v_refunded);
end; $$;

revoke all on function public.review_lead_refund_request(uuid, text, text) from public;
grant execute on function public.review_lead_refund_request(uuid, text, text) to authenticated;