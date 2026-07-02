alter table public.offer_comparisons enable row level security;

create policy "Project owners can read offer comparisons"
on public.offer_comparisons for select to authenticated
using (exists (
  select 1 from public.projects p
  where p.id = offer_comparisons.project_id and p.buyer_id = auth.uid()
));

create policy "Project owners can insert offer comparisons"
on public.offer_comparisons for insert to authenticated
with check (exists (
  select 1 from public.projects p
  where p.id = offer_comparisons.project_id and p.buyer_id = auth.uid()
));

create policy "Project owners can update offer comparisons"
on public.offer_comparisons for update to authenticated
using (exists (
  select 1 from public.projects p
  where p.id = offer_comparisons.project_id and p.buyer_id = auth.uid()
))
with check (exists (
  select 1 from public.projects p
  where p.id = offer_comparisons.project_id and p.buyer_id = auth.uid()
));

alter table public.project_agreements enable row level security;

create policy "Agreement parties can read"
on public.project_agreements for select to authenticated
using (exists (
  select 1 from public.projects p
  join public.offers o on o.id = project_agreements.offer_id and o.project_id = p.id
  where p.id = project_agreements.project_id
    and (p.buyer_id = auth.uid() or o.supplier_id = auth.uid())
));

create policy "Agreement parties can insert"
on public.project_agreements for insert to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.projects p
    join public.offers o on o.id = project_agreements.offer_id and o.project_id = p.id
    where p.id = project_agreements.project_id
      and o.status = 'accepted'
      and (p.buyer_id = auth.uid() or o.supplier_id = auth.uid())
  )
);

create policy "Agreement parties can update"
on public.project_agreements for update to authenticated
using (exists (
  select 1 from public.projects p
  join public.offers o on o.id = project_agreements.offer_id and o.project_id = p.id
  where p.id = project_agreements.project_id
    and o.status = 'accepted'
    and (p.buyer_id = auth.uid() or o.supplier_id = auth.uid())
))
with check (exists (
  select 1 from public.projects p
  join public.offers o on o.id = project_agreements.offer_id and o.project_id = p.id
  where p.id = project_agreements.project_id
    and o.status = 'accepted'
    and (p.buyer_id = auth.uid() or o.supplier_id = auth.uid())
));
