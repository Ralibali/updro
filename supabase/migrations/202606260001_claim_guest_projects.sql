-- Connect guest submissions to a buyer account created with the same email.

create or replace function public.claim_guest_projects_for_buyer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> 'buyer' or new.email is null then
    return new;
  end if;

  update public.guest_leads
  set claimed_by = new.id,
      updated_at = now()
  where claimed_by is null
    and lower(email) = lower(new.email);

  update public.projects p
  set buyer_id = new.id,
      updated_at = now()
  from public.guest_leads gl
  where p.guest_lead_id = gl.id
    and p.buyer_id is null
    and gl.claimed_by = new.id;

  return new;
end;
$$;

drop trigger if exists trg_claim_guest_projects_for_buyer on public.profiles;
create trigger trg_claim_guest_projects_for_buyer
after insert or update of email, role on public.profiles
for each row execute function public.claim_guest_projects_for_buyer();

-- Backfill guest projects for buyer accounts that already exist.
update public.guest_leads gl
set claimed_by = p.id,
    updated_at = now()
from public.profiles p
where gl.claimed_by is null
  and p.role = 'buyer'
  and p.email is not null
  and lower(p.email) = lower(gl.email);

update public.projects pr
set buyer_id = gl.claimed_by,
    updated_at = now()
from public.guest_leads gl
where pr.guest_lead_id = gl.id
  and pr.buyer_id is null
  and gl.claimed_by is not null;
