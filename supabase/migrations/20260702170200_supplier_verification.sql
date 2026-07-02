alter table public.supplier_profiles
  add constraint supplier_profiles_company_status_check
  check (company_status in ('active', 'inactive', 'unknown'));

alter table public.supplier_profiles
  add constraint supplier_profiles_verified_level_check
  check (verified_level in ('none', 'basic', 'verified', 'premium'));

update public.supplier_profiles
set verified_level = case when coalesce(is_verified, false) then 'verified' else 'basic' end,
    f_skatt = coalesce(has_fskatt, false)
where verified_level = 'none';

create or replace function public.sync_supplier_verification_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.f_skatt := coalesce(new.has_fskatt, false);
  if coalesce(new.is_verified, false) then
    new.verified_level := case when new.verified_level = 'premium' then 'premium' else 'verified' end;
    new.verified_at := coalesce(new.verified_at, now());
    new.verified_by := coalesce(new.verified_by, auth.uid());
  elsif tg_op = 'UPDATE' and coalesce(old.is_verified, false) and not coalesce(new.is_verified, false) then
    new.verified_level := 'none';
    new.verified_at := null;
    new.verified_by := null;
  end if;
  return new;
end;
$$;

create trigger sync_supplier_verification
before insert or update of is_verified, has_fskatt
on public.supplier_profiles
for each row execute function public.sync_supplier_verification_fields();
