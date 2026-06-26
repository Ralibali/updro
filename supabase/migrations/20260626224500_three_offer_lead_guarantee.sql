-- Updro marketplace v2: högst tre offerter och en serverstyrd leadgaranti.

alter table public.projects
  alter column max_offers set default 3;

-- Nya och pågående uppdrag ska normalt bara ta emot tre offerter.
-- Uppdrag som redan har fler än tre offerter behåller tillräcklig kapacitet
-- för att inte hamna i ett inkonsekvent läge.
update public.projects
set max_offers = greatest(3, coalesce(offer_count, 0)),
    updated_at = now()
where coalesce(max_offers, 5) = 5
  and coalesce(status, 'pending') in ('pending', 'active');

alter table public.unlocked_leads
  add column if not exists credit_charged boolean not null default true;

-- Bästa möjliga bakåtfyllnad för gamla upplåsningar. Nya upplåsningar märks
-- exakt av triggern nedan.
update public.unlocked_leads unlocked
set credit_charged = coalesce(profile.plan, 'none') <> 'monthly'
from public.supplier_profiles profile
where profile.id = unlocked.supplier_id;

create or replace function public.debit_credit_before_unlock()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_plan text;
  v_credits integer;
  v_trial_ends timestamptz;
  v_trial_used integer;
  v_status text;
  v_offer_count integer;
  v_max_offers integer;
begin
  if auth.uid() is null or new.supplier_id <> auth.uid() then
    raise exception 'Ogiltig byråanvändare.';
  end if;

  select status, coalesce(offer_count, 0), coalesce(max_offers, 3)
  into v_status, v_offer_count, v_max_offers
  from public.projects
  where id = new.project_id;

  if not found then
    raise exception 'Uppdraget finns inte.';
  end if;

  if v_status <> 'active' or v_offer_count >= v_max_offers then
    raise exception 'Uppdraget tar inte emot fler offerter.';
  end if;

  select plan, coalesce(lead_credits, 0), trial_ends_at, coalesce(trial_leads_used, 0)
  into v_plan, v_credits, v_trial_ends, v_trial_used
  from public.supplier_profiles
  where id = new.supplier_id
  for update;

  if not found then
    raise exception 'Byråprofilen kunde inte hittas.';
  end if;

  if coalesce(v_plan, 'none') <> 'monthly' then
    if v_plan = 'trial' and (v_trial_ends is null or v_trial_ends <= now()) then
      raise exception 'Din provperiod har gått ut.';
    end if;

    if v_credits <= 0 then
      raise exception 'Du har inga lead-krediter kvar.';
    end if;

    new.credit_charged := true;
    new.used_trial_credit := v_plan = 'trial';

    update public.supplier_profiles
    set lead_credits = v_credits - 1,
        trial_leads_used = case
          when v_plan = 'trial' then v_trial_used + 1
          else trial_leads_used
        end
    where id = new.supplier_id;
  else
    new.credit_charged := false;
    new.used_trial_credit := false;
  end if;

  return new;
end;
$$;

create or replace function public.unlock_project_for_supplier(p_project_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing uuid;
  v_credits integer;
  v_inserted uuid;
begin
  if v_user_id is null then
    raise exception 'Du måste vara inloggad.';
  end if;

  -- Serialiserar samtidiga upplåsningar från samma byrå så att dubbelklick
  -- aldrig kan debitera två krediter.
  perform 1
  from public.supplier_profiles
  where id = v_user_id
  for update;

  if not found then
    raise exception 'Byråprofilen kunde inte hittas.';
  end if;

  select id into v_existing
  from public.unlocked_leads
  where supplier_id = v_user_id
    and project_id = p_project_id;

  if v_existing is null then
    insert into public.unlocked_leads (supplier_id, project_id)
    values (v_user_id, p_project_id)
    returning id into v_inserted;
  end if;

  select coalesce(lead_credits, 0)
  into v_credits
  from public.supplier_profiles
  where id = v_user_id;

  return jsonb_build_object(
    'already_unlocked', v_existing is not null,
    'credits_left', coalesce(v_credits, 0)
  );
end;
$$;

grant execute on function public.unlock_project_for_supplier(uuid) to authenticated;

create or replace function public.validate_offer_before_insert()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_status text;
  v_max_offers integer;
  v_offer_count integer;
begin
  if auth.uid() is null or new.supplier_id <> auth.uid() then
    raise exception 'Ogiltig byråanvändare.';
  end if;

  if not exists (
    select 1
    from public.unlocked_leads
    where supplier_id = new.supplier_id
      and project_id = new.project_id
  ) then
    raise exception 'Lås upp uppdraget innan du skickar offert.';
  end if;

  if length(trim(coalesce(new.title, ''))) < 3 then
    raise exception 'Offertens titel är för kort.';
  end if;

  if length(trim(coalesce(new.description, ''))) < 20 then
    raise exception 'Beskriv offerten med minst 20 tecken.';
  end if;

  if new.price is null or new.price <= 0 then
    raise exception 'Ange ett giltigt pris.';
  end if;

  select status, coalesce(max_offers, 3)
  into v_status, v_max_offers
  from public.projects
  where id = new.project_id
  for update;

  if not found then
    raise exception 'Uppdraget finns inte.';
  end if;

  select count(*)::integer
  into v_offer_count
  from public.offers
  where project_id = new.project_id;

  if v_status <> 'active' or v_offer_count >= v_max_offers then
    raise exception 'Uppdraget tar inte emot fler offerter.';
  end if;

  new.title := trim(new.title);
  new.description := trim(new.description);
  return new;
end;
$$;

create or replace function public.sync_project_offer_count()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_project_id uuid;
  v_count integer;
  v_max integer;
begin
  v_project_id := case when tg_op = 'DELETE' then old.project_id else new.project_id end;

  select count(*)::integer
  into v_count
  from public.offers
  where project_id = v_project_id;

  select coalesce(max_offers, 3)
  into v_max
  from public.projects
  where id = v_project_id;

  update public.projects
  set offer_count = v_count,
      status = case
        when tg_op <> 'DELETE' and v_count >= v_max and status = 'active' then 'closed'
        else status
      end,
      updated_at = now()
  where id = v_project_id;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create or replace function public.submit_project_offer(
  p_project_id uuid,
  p_title text,
  p_description text,
  p_price numeric,
  p_delivery_weeks integer default null,
  p_payment_plan text default 'fixed',
  p_attachment_url text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_status text;
  v_max_offers integer;
  v_offer_count integer;
  v_offer_id uuid;
begin
  if v_user_id is null then
    raise exception 'Du måste vara inloggad.';
  end if;

  if not exists (select 1 from public.supplier_profiles where id = v_user_id) then
    raise exception 'Endast registrerade byråer kan skicka offerter.';
  end if;

  if not exists (
    select 1
    from public.unlocked_leads
    where supplier_id = v_user_id
      and project_id = p_project_id
  ) then
    raise exception 'Lås upp uppdraget innan du skickar offert.';
  end if;

  if length(trim(coalesce(p_title, ''))) < 3 then
    raise exception 'Offertens titel är för kort.';
  end if;

  if length(trim(coalesce(p_description, ''))) < 20 then
    raise exception 'Beskriv offerten med minst 20 tecken.';
  end if;

  if p_price is null or p_price <= 0 then
    raise exception 'Ange ett giltigt pris.';
  end if;

  if p_payment_plan not in ('fixed', 'hourly', 'milestone') then
    raise exception 'Ogiltig betalningsmodell.';
  end if;

  select status, coalesce(max_offers, 3)
  into v_status, v_max_offers
  from public.projects
  where id = p_project_id
  for update;

  if not found then
    raise exception 'Uppdraget finns inte.';
  end if;

  select count(*)::integer
  into v_offer_count
  from public.offers
  where project_id = p_project_id;

  if v_status <> 'active' or v_offer_count >= v_max_offers then
    raise exception 'Uppdraget tar inte emot fler offerter.';
  end if;

  insert into public.offers (
    project_id,
    supplier_id,
    title,
    description,
    price,
    delivery_weeks,
    payment_plan,
    attachment_url
  ) values (
    p_project_id,
    v_user_id,
    trim(p_title),
    trim(p_description),
    p_price,
    p_delivery_weeks,
    p_payment_plan,
    p_attachment_url
  )
  returning id into v_offer_id;

  return v_offer_id;
end;
$$;

grant execute on function public.submit_project_offer(uuid, text, text, numeric, integer, text, text) to authenticated;

create table if not exists public.lead_refund_requests (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  unlocked_lead_id uuid not null references public.unlocked_leads(id) on delete cascade,
  reason text not null check (reason in (
    'invalid_contact',
    'no_response',
    'fake_lead',
    'duplicate',
    'wrong_scope',
    'other'
  )),
  details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  credit_refunded boolean not null default false,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (supplier_id, project_id)
);

create index if not exists lead_refund_requests_status_created_idx
  on public.lead_refund_requests (status, created_at desc);

alter table public.lead_refund_requests enable row level security;

drop policy if exists "Suppliers read own lead refund requests" on public.lead_refund_requests;
create policy "Suppliers read own lead refund requests"
on public.lead_refund_requests
for select
to authenticated
using (supplier_id = auth.uid());

drop policy if exists "Admins read lead refund requests" on public.lead_refund_requests;
create policy "Admins read lead refund requests"
on public.lead_refund_requests
for select
to authenticated
using (public.is_admin(auth.uid()));

create or replace function public.request_lead_refund(
  p_project_id uuid,
  p_reason text,
  p_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_unlock public.unlocked_leads%rowtype;
  v_request_id uuid;
begin
  if v_user_id is null then
    raise exception 'Du måste vara inloggad.';
  end if;

  if p_reason not in ('invalid_contact', 'no_response', 'fake_lead', 'duplicate', 'wrong_scope', 'other') then
    raise exception 'Välj en giltig anledning.';
  end if;

  select *
  into v_unlock
  from public.unlocked_leads
  where supplier_id = v_user_id
    and project_id = p_project_id;

  if not found then
    raise exception 'Du måste ha låst upp uppdraget för att använda leadgarantin.';
  end if;

  if coalesce(v_unlock.created_at, now()) < now() - interval '7 days' then
    raise exception 'Leadgarantin gäller i sju dagar från upplåsningen.';
  end if;

  if p_reason = 'no_response'
     and coalesce(v_unlock.created_at, now()) > now() - interval '48 hours' then
    raise exception 'Vänta minst 48 timmar innan du anmäler att kunden inte svarar.';
  end if;

  insert into public.lead_refund_requests (
    supplier_id,
    project_id,
    unlocked_lead_id,
    reason,
    details
  ) values (
    v_user_id,
    p_project_id,
    v_unlock.id,
    p_reason,
    nullif(left(trim(coalesce(p_details, '')), 1500), '')
  )
  returning id into v_request_id;

  return v_request_id;
exception
  when unique_violation then
    raise exception 'Du har redan skickat en garantiansökan för detta uppdrag.';
end;
$$;

revoke all on function public.request_lead_refund(uuid, text, text) from public;
grant execute on function public.request_lead_refund(uuid, text, text) to authenticated;

create or replace function public.review_lead_refund_request(
  p_request_id uuid,
  p_decision text,
  p_admin_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
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

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Ogiltigt beslut.';
  end if;

  select *
  into v_request
  from public.lead_refund_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Garantiansökan finns inte.';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'Garantiansökan är redan behandlad.';
  end if;

  select *
  into v_unlock
  from public.unlocked_leads
  where id = v_request.unlocked_lead_id
  for update;

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
  set status = p_decision,
      credit_refunded = v_refunded,
      reviewed_by = v_admin_id,
      reviewed_at = now(),
      admin_note = nullif(left(trim(coalesce(p_admin_note, '')), 1500), ''),
      updated_at = now()
  where id = p_request_id;

  insert into public.audit_log (admin_id, action, target_type, target_id, details)
  values (
    v_admin_id,
    'review_lead_refund',
    'lead_refund_request',
    p_request_id,
    jsonb_build_object(
      'decision', p_decision,
      'supplier_id', v_request.supplier_id,
      'project_id', v_request.project_id,
      'credit_refunded', v_refunded
    )
  );

  return jsonb_build_object(
    'status', p_decision,
    'credit_refunded', v_refunded
  );
end;
$$;

revoke all on function public.review_lead_refund_request(uuid, text, text) from public;
grant execute on function public.review_lead_refund_request(uuid, text, text) to authenticated;
