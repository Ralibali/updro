-- Restore the missing admin view without widening access to private tables.
create or replace view public.marketplace_category_health
with (security_invoker = true)
as
with project_demand as (
  select category, count(*) as open_projects
  from public.projects
  where status in ('pending', 'active') and public.is_admin(auth.uid())
  group by category
), supplier_supply as (
  select category, count(distinct sp.id) as active_suppliers
  from public.supplier_profiles sp
  cross join lateral unnest(coalesce(sp.categories, array[]::text[])) as category
  where sp.is_verified = true and public.is_admin(auth.uid())
  group by category
)
select
  coalesce(d.category, s.category) as category,
  coalesce(d.open_projects, 0) as open_projects,
  coalesce(s.active_suppliers, 0) as active_suppliers,
  case
    when coalesce(d.open_projects, 0) > 0 and coalesce(s.active_suppliers, 0) = 0 then 'pause_or_recruit'
    when coalesce(d.open_projects, 0) >= 3 and coalesce(s.active_suppliers, 0) < 2 then 'low_supply'
    when coalesce(s.active_suppliers, 0) >= 3 then 'healthy'
    else 'watch'
  end as health_status
from project_demand d
full outer join supplier_supply s on s.category = d.category;

revoke all on public.marketplace_category_health from public, anon;
grant select on public.marketplace_category_health to authenticated;
comment on view public.marketplace_category_health is
  'Admin-only category overview. active_suppliers counts verified profiles, not confirmed availability.';
notify pgrst, 'reload schema';
