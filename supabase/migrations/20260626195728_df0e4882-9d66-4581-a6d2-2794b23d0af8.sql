drop policy if exists "Public read offer attachments" on storage.objects;
drop policy if exists "Anyone can read offer attachments" on storage.objects;

drop policy if exists "Supplier uploads offer attachment" on storage.objects;
create policy "Supplier uploads offer attachment"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'offer-attachments'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

drop policy if exists "Supplier deletes own offer attachment" on storage.objects;
create policy "Supplier deletes own offer attachment"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'offer-attachments'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

drop policy if exists "Parties read offer attachments" on storage.objects;
create policy "Parties read offer attachments"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'offer-attachments'
    and (
      (storage.foldername(name))[1] = (auth.uid())::text
      or public.is_admin(auth.uid())
      or exists (
        select 1
        from public.offers o
        join public.projects p on p.id = o.project_id
        where p.buyer_id = auth.uid()
          and (o.supplier_id)::text = (storage.foldername(objects.name))[1]
      )
    )
  );
