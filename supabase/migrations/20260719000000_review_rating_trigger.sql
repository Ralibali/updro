-- Håll supplier_profiles.avg_rating och review_count uppdaterade när omdömen
-- skrivs, ändras eller tas bort. Uppdateringen sker i nästlad trigger (depth >= 2),
-- vilket är det uttryckligen tillåtna sättet att underhålla skyddade trust-fält
-- enligt public.prevent_supplier_trust_field_changes().

CREATE OR REPLACE FUNCTION public.refresh_supplier_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_supplier uuid;
BEGIN
  target_supplier := coalesce(NEW.supplier_id, OLD.supplier_id);

  UPDATE public.supplier_profiles sp
  SET avg_rating = agg.avg_rating,
      review_count = agg.review_count
  FROM (
    SELECT coalesce(round(avg(r.rating)::numeric, 1), 0) AS avg_rating,
           count(*)::int AS review_count
    FROM public.reviews r
    WHERE r.supplier_id = target_supplier
  ) agg
  WHERE sp.id = target_supplier;

  RETURN coalesce(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_supplier_rating() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS reviews_refresh_rating_insert ON public.reviews;
DROP TRIGGER IF EXISTS reviews_refresh_rating_update ON public.reviews;
DROP TRIGGER IF EXISTS reviews_refresh_rating_delete ON public.reviews;

CREATE TRIGGER reviews_refresh_rating_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_supplier_rating();

CREATE TRIGGER reviews_refresh_rating_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_supplier_rating();

CREATE TRIGGER reviews_refresh_rating_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_supplier_rating();
