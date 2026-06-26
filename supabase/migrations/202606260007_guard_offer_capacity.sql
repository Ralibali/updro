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
    select 1 from public.unlocked_leads
    where supplier_id = new.supplier_id and project_id = new.project_id
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

  select status, coalesce(max_offers, 5)
  into v_status, v_max_offers
  from public.projects
  where id = new.project_id
  for update;

  if not found then
    raise exception 'Uppdraget finns inte.';
  end if;

  select count(*)::integer into v_offer_count
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

drop trigger if exists validate_offer_before_insert on public.offers;
create trigger validate_offer_before_insert
before insert on public.offers
for each row execute function public.validate_offer_before_insert();

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

  select count(*)::integer into v_count
  from public.offers
  where project_id = v_project_id;

  select coalesce(max_offers, 5) into v_max
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

drop trigger if exists sync_project_offer_count on public.offers;
create trigger sync_project_offer_count
after insert or delete on public.offers
for each row execute function public.sync_project_offer_count();

create or replace function public.guard_supplier_project_counters()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if pg_trigger_depth() = 1
    and auth.uid() is not null
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'supplier') then
    new.offer_count := old.offer_count;
    new.status := old.status;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_supplier_project_counters on public.projects;
create trigger guard_supplier_project_counters
before update on public.projects
for each row execute function public.guard_supplier_project_counters();

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
