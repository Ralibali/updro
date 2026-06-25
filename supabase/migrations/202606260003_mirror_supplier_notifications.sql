-- Mirror supplier lead matches into the shared notification feed used by the navbar bell.

create or replace function public.mirror_supplier_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    link
  ) values (
    new.supplier_id,
    new.type,
    new.title,
    new.body,
    case
      when new.project_id is not null then '/dashboard/supplier/uppdrag/' || new.project_id::text
      else '/dashboard/supplier'
    end
  );

  return new;
end;
$$;

drop trigger if exists trg_mirror_supplier_notification on public.supplier_notifications;
create trigger trg_mirror_supplier_notification
after insert on public.supplier_notifications
for each row execute function public.mirror_supplier_notification();
