CREATE TABLE IF NOT EXISTS public.project_attributions (
  project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  first_source text,
  first_medium text,
  first_campaign text,
  first_term text,
  first_content text,
  first_landing_path text,
  first_referrer text,
  first_touch_at timestamptz,
  latest_source text,
  latest_medium text,
  latest_campaign text,
  latest_term text,
  latest_content text,
  latest_landing_path text,
  latest_referrer text,
  latest_touch_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.project_attributions TO authenticated;
GRANT ALL ON public.project_attributions TO service_role;

ALTER TABLE public.project_attributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read project attributions" ON public.project_attributions;
CREATE POLICY "Admins read project attributions"
  ON public.project_attributions
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Buyer reads own project attribution" ON public.project_attributions;
CREATE POLICY "Buyer reads own project attribution"
  ON public.project_attributions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_attributions.project_id AND p.buyer_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS project_attributions_first_source_idx
  ON public.project_attributions (first_source);
CREATE INDEX IF NOT EXISTS project_attributions_created_at_idx
  ON public.project_attributions (created_at DESC);

DROP TRIGGER IF EXISTS project_attributions_set_updated_at ON public.project_attributions;
CREATE TRIGGER project_attributions_set_updated_at
  BEFORE UPDATE ON public.project_attributions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();