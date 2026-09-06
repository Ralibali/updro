-- A narrow public read boundary for the existing verified agency directory.
-- Private profiles, contact details and billing tables keep their existing RLS.
CREATE OR REPLACE FUNCTION public.get_public_agencies()
RETURNS TABLE (
  id uuid, slug text, bio text, categories text[], services text[],
  logo_url text, cover_url text, website_url text, portfolio_urls text[],
  company_name text, city text, avatar_url text, created_at timestamptz,
  is_verified boolean, avg_rating numeric, review_count bigint, completed_projects bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT sp.id, sp.slug, sp.bio, sp.categories, sp.services,
    sp.logo_url, sp.cover_url, sp.website_url, sp.portfolio_urls,
    p.company_name, p.city, p.avatar_url, sp.created_at,
    sp.is_verified,
    COALESCE(r.avg_rating, 0), COALESCE(r.review_count, 0), COALESCE(done.completed_projects, 0)
  FROM public.supplier_profiles sp
  JOIN public.profiles p ON p.id = sp.id
  LEFT JOIN LATERAL (
    SELECT avg(rev.rating)::numeric AS avg_rating, count(*) AS review_count
    FROM public.reviews rev
    JOIN public.projects project ON project.id = rev.project_id
    WHERE rev.supplier_id = sp.id AND project.status = 'completed'
      AND rev.buyer_id = project.buyer_id
      AND EXISTS (SELECT 1 FROM public.offers offer WHERE offer.project_id = project.id AND offer.supplier_id = sp.id AND offer.status = 'accepted')
  ) r ON true
  LEFT JOIN LATERAL (
    SELECT count(DISTINCT project.id) AS completed_projects
    FROM public.projects project
    JOIN public.offers offer ON offer.project_id = project.id
    WHERE project.status = 'completed' AND offer.supplier_id = sp.id AND offer.status = 'accepted'
  ) done ON true
  WHERE sp.is_verified IS TRUE
    AND nullif(btrim(sp.slug), '') IS NOT NULL
    AND nullif(btrim(p.company_name), '') IS NOT NULL;
$function$;

REVOKE ALL ON FUNCTION public.get_public_agencies() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_agencies() TO anon, authenticated, service_role;
COMMENT ON FUNCTION public.get_public_agencies() IS 'Public company presentation for verified suppliers only. Excludes personal contact, tax identifiers and billing data. Activity figures are derived from completed marketplace records.';
