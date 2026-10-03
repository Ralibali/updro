-- Private supplier-side sales follow-up state.
-- Kept separate from offers because buyers can read offer rows.

create table if not exists public.supplier_offer_followups (
  offer_id uuid primary key references public.offers(id) on delete cascade,
  supplier_id uuid not null references public.profiles(id) on delete cascade,
  next_action text,
  follow_up_at timestamptz,
  private_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_offer_followups_next_action_length
    check (next_action is null or char_length(next_action) <= 500),
  constraint supplier_offer_followups_private_note_length
    check (private_note is null or char_length(private_note) <= 4000)
);

alter table public.supplier_offer_followups enable row level security;

grant select, insert, update, delete
  on public.supplier_offer_followups
  to authenticated;

drop policy if exists "Suppliers read own offer follow-ups"
  on public.supplier_offer_followups;
create policy "Suppliers read own offer follow-ups"
  on public.supplier_offer_followups
  for select
  to authenticated
  using (
    supplier_id = (select auth.uid())
    and exists (
      select 1
      from public.offers
      where offers.id = supplier_offer_followups.offer_id
        and offers.supplier_id = (select auth.uid())
    )
  );

drop policy if exists "Suppliers insert own offer follow-ups"
  on public.supplier_offer_followups;
create policy "Suppliers insert own offer follow-ups"
  on public.supplier_offer_followups
  for insert
  to authenticated
  with check (
    supplier_id = (select auth.uid())
    and exists (
      select 1
      from public.offers
      where offers.id = supplier_offer_followups.offer_id
        and offers.supplier_id = (select auth.uid())
    )
  );

drop policy if exists "Suppliers update own offer follow-ups"
  on public.supplier_offer_followups;
create policy "Suppliers update own offer follow-ups"
  on public.supplier_offer_followups
  for update
  to authenticated
  using (
    supplier_id = (select auth.uid())
    and exists (
      select 1
      from public.offers
      where offers.id = supplier_offer_followups.offer_id
        and offers.supplier_id = (select auth.uid())
    )
  )
  with check (
    supplier_id = (select auth.uid())
    and exists (
      select 1
      from public.offers
      where offers.id = supplier_offer_followups.offer_id
        and offers.supplier_id = (select auth.uid())
    )
  );

drop policy if exists "Suppliers delete own offer follow-ups"
  on public.supplier_offer_followups;
create policy "Suppliers delete own offer follow-ups"
  on public.supplier_offer_followups
  for delete
  to authenticated
  using (
    supplier_id = (select auth.uid())
    and exists (
      select 1
      from public.offers
      where offers.id = supplier_offer_followups.offer_id
        and offers.supplier_id = (select auth.uid())
    )
  );

create index if not exists idx_supplier_offer_followups_supplier_due
  on public.supplier_offer_followups(supplier_id, follow_up_at)
  where follow_up_at is not null;

comment on table public.supplier_offer_followups is
  'Private supplier-only sales planning for submitted offers; never exposed to buyers.';
