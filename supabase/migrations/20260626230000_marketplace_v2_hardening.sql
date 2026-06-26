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

  select plan, coalesce(lead_credits, 0), trial_ends_at, coalesce(trial_leads_used, 0)
  into v_plan, v_credits, v_trial_ends, v_trial_used
  from public.supplier_profiles
  where id = new.supplier_id
  for update;

  if not found then
    raise exception 'Byråprofilen kunde inte hittas.';
  end if;

  if exists (
    select 1 from public.unlocked_leads
    where supplier_id = new.supplier_id and project_id = new.project_id
  ) then
    raise exception 'Uppdraget är redan upplåst.';
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
        trial_leads_used = case when v_plan = 'trial' then v_trial_used + 1 else trial_leads_used end
    where id = new.supplier_id;
  else
    new.credit_charged := false;
    new.used_trial_credit := false;
  end if;

  return new;
end;
$$;

update public.projects
set status = 'closed', updated_at = now()
where status = 'active'
  and coalesce(offer_count, 0) >= coalesce(max_offers, 3);

alter table public.projects drop constraint if exists projects_max_offers_reasonable;
alter table public.projects
  add constraint projects_max_offers_reasonable
  check (max_offers is null or max_offers between 1 and 10)
  not valid;
alter table public.projects validate constraint projects_max_offers_reasonable;
