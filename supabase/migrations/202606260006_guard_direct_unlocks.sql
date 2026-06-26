create or replace function public.guard_supplier_credit_updates()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() = old.id then
    if coalesce(new.lead_credits, 0) > coalesce(old.lead_credits, 0) then
      new.lead_credits := old.lead_credits;
    end if;
    if coalesce(new.trial_leads_used, 0) < coalesce(old.trial_leads_used, 0) then
      new.trial_leads_used := old.trial_leads_used;
    end if;
    if new.plan is distinct from old.plan then
      new.plan := old.plan;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_supplier_credit_updates on public.supplier_profiles;
create trigger guard_supplier_credit_updates
before update on public.supplier_profiles
for each row execute function public.guard_supplier_credit_updates();

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

  select status, coalesce(offer_count, 0), coalesce(max_offers, 5)
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

    new.used_trial_credit := v_plan = 'trial';
    update public.supplier_profiles
    set lead_credits = v_credits - 1,
        trial_leads_used = case when v_plan = 'trial' then v_trial_used + 1 else trial_leads_used end
    where id = new.supplier_id;
  else
    new.used_trial_credit := false;
  end if;

  return new;
end;
$$;

drop trigger if exists debit_credit_before_unlock on public.unlocked_leads;
create trigger debit_credit_before_unlock
before insert on public.unlocked_leads
for each row execute function public.debit_credit_before_unlock();

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
begin
  if v_user_id is null then
    raise exception 'Du måste vara inloggad.';
  end if;

  select id into v_existing
  from public.unlocked_leads
  where supplier_id = v_user_id and project_id = p_project_id;

  if v_existing is null then
    insert into public.unlocked_leads (supplier_id, project_id)
    values (v_user_id, p_project_id);
  end if;

  select coalesce(lead_credits, 0) into v_credits
  from public.supplier_profiles
  where id = v_user_id;

  return jsonb_build_object(
    'already_unlocked', v_existing is not null,
    'credits_left', coalesce(v_credits, 0)
  );
end;
$$;
