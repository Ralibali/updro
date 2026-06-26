create unique index if not exists offers_supplier_project_uidx
on public.offers (supplier_id, project_id);

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
    select 1 from public.unlocked_leads
    where supplier_id = v_user_id and project_id = p_project_id
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

  select status, coalesce(max_offers, 5)
  into v_status, v_max_offers
  from public.projects
  where id = p_project_id
  for update;

  if not found then
    raise exception 'Uppdraget finns inte.';
  end if;

  select count(*)::integer into v_offer_count
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

  v_offer_count := v_offer_count + 1;

  update public.projects
  set offer_count = v_offer_count,
      status = case when v_offer_count >= v_max_offers then 'closed' else status end,
      updated_at = now()
  where id = p_project_id;

  return v_offer_id;
end;
$$;

grant execute on function public.submit_project_offer(uuid, text, text, numeric, integer, text, text) to authenticated;

update public.projects p
set offer_count = counts.total,
    status = case
      when counts.total >= coalesce(p.max_offers, 5) and p.status = 'active' then 'closed'
      else p.status
    end,
    updated_at = now()
from (
  select project_id, count(*)::integer as total
  from public.offers
  group by project_id
) counts
where p.id = counts.project_id;
