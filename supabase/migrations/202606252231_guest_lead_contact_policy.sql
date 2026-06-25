-- A supplier may read a guest lead only after unlocking its project.

drop policy if exists "Suppliers can read unlocked guest leads" on public.guest_leads;
create policy "Suppliers can read unlocked guest leads"
on public.guest_leads
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    join public.unlocked_leads ul on ul.project_id = p.id
    where p.guest_lead_id = guest_leads.id
      and ul.supplier_id = auth.uid()
  )
);
