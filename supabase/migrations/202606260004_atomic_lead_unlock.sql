create unique index if not exists unlocked_leads_supplier_project_uidx
on public.unlocked_leads (supplier_id, project_id);

create or replace function public.unlock_project_for_supplier(p_project_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan text;
  v_credits integer;
  v_trial_ends_at timestamptz;
  v_trial_used integer;
  v_status text;
  v_offer_count integer;
  v_max_offers integer;
  v_existing uuid;
  v_is_trial boolean := false;
begin
  if v_user_id is null then
    raise exception 'Du måste vara inloggad.';
  end if;

  select plan, coalesce(lead_credits, 0), trial_ends_at, coalesce(trial_leads_used, 0)
  into v_plan, v_credits, v_trial_ends_at, v_trial_used
  from public.supplier_profiles
  where id = v_user_id
  for update;

  if not found then
    raise exception 'Byråprofilen kunde inte hittas.';
  end if;

  select status, coalesce(offer_count, 0), coalesce(max_offers, 5)
  into v_status, v_offer_count, v_max_offers
  from public.projects
  where id = p_project_id;

  if not found then
    raise exception 'Uppdraget finns inte.';
  end if;

  if v_status <> 'active' or v_offer_count >= v_max_offers then
    raise exception 'Uppdraget tar inte emot fler offerter.';
  end if;

  select id into v_existing
  from public.unlocked_leads
  where supplier_id = v_user_id and project_id = p_project_id;

  if v_existing is not null then
    return jsonb_build_object('already_unlocked', true, 'credits_left', v_credits);
  end if;

  if coalesce(v_plan, 'none') <> 'monthly' then
    if v_plan = 'trial' and (v_trial_ends_at is null or v_trial_ends_at <= now()) then
      raise exception 'Din provperiod har gått ut.';
    end if;

    if v_credits <= 0 then
      raise exception 'Du har inga lead-krediter kvar.';
    end if;

    v_is_trial := v_plan = 'trial';

    update public.supplier_profiles
    set lead_credits = v_credits - 1,
        trial_leads_used = case when v_is_trial then v_trial_used + 1 else trial_leads_used end
    where id = v_user_id;

    v_credits := v_credits - 1;
  end if;

  insert into public.unlocked_leads (supplier_id, project_id, used_trial_credit)
  values (v_user_id, p_project_id, v_is_trial);

  return jsonb_build_object('already_unlocked', false, 'credits_left', v_credits);
end;
$$;

grant execute on function public.unlock_project_for_supplier(uuid) to authenticated;
