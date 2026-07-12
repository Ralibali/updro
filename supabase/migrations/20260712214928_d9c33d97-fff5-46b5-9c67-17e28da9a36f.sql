-- Fresh schema. Old plural table is not in use yet.
DROP TABLE IF EXISTS public.project_attributions CASCADE;

CREATE TABLE IF NOT EXISTS public.project_attribution (
  project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  first_touch jsonb,
  latest_touch jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.project_attribution TO authenticated;
GRANT ALL ON public.project_attribution TO service_role;

ALTER TABLE public.project_attribution ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner or admin reads project attribution" ON public.project_attribution;
CREATE POLICY "Owner or admin reads project attribution"
  ON public.project_attribution
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_attribution.project_id AND p.buyer_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS project_attribution_first_source_idx
  ON public.project_attribution ((first_touch->>'source'));
CREATE INDEX IF NOT EXISTS project_attribution_created_at_idx
  ON public.project_attribution (created_at DESC);

DROP TRIGGER IF EXISTS project_attribution_set_updated_at ON public.project_attribution;
CREATE TRIGGER project_attribution_set_updated_at
  BEFORE UPDATE ON public.project_attribution
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();

-- Internal validator: only allow known keys with length caps and drop empty touches.
CREATE OR REPLACE FUNCTION public.sanitize_attribution_touch(p jsonb)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  r jsonb := '{}'::jsonb;
  v_source text;
  v_medium text;
  v_campaign text;
  v_term text;
  v_content text;
  v_landing text;
  v_referrer text;
  v_ts text;
BEGIN
  IF p IS NULL OR jsonb_typeof(p) <> 'object' THEN RETURN NULL; END IF;
  v_source   := nullif(left(trim(coalesce(p->>'source','')), 100), '');
  v_medium   := nullif(left(trim(coalesce(p->>'medium','')), 100), '');
  v_campaign := nullif(left(trim(coalesce(p->>'campaign','')), 150), '');
  v_term     := nullif(left(trim(coalesce(p->>'term','')), 150), '');
  v_content  := nullif(left(trim(coalesce(p->>'content','')), 150), '');
  v_landing  := nullif(left(trim(coalesce(p->>'landing_path','')), 300), '');
  v_referrer := nullif(left(trim(coalesce(p->>'referrer','')), 500), '');
  v_ts       := nullif(left(trim(coalesce(p->>'timestamp','')), 40), '');
  IF v_source IS NULL AND v_medium IS NULL AND v_campaign IS NULL AND v_term IS NULL
     AND v_content IS NULL AND v_landing IS NULL AND v_referrer IS NULL THEN
    RETURN NULL;
  END IF;
  IF v_source   IS NOT NULL THEN r := r || jsonb_build_object('source', v_source); END IF;
  IF v_medium   IS NOT NULL THEN r := r || jsonb_build_object('medium', v_medium); END IF;
  IF v_campaign IS NOT NULL THEN r := r || jsonb_build_object('campaign', v_campaign); END IF;
  IF v_term     IS NOT NULL THEN r := r || jsonb_build_object('term', v_term); END IF;
  IF v_content  IS NOT NULL THEN r := r || jsonb_build_object('content', v_content); END IF;
  IF v_landing  IS NOT NULL THEN r := r || jsonb_build_object('landing_path', v_landing); END IF;
  IF v_referrer IS NOT NULL THEN r := r || jsonb_build_object('referrer', v_referrer); END IF;
  IF v_ts       IS NOT NULL THEN r := r || jsonb_build_object('timestamp', v_ts); END IF;
  RETURN r;
END; $$;

REVOKE ALL ON FUNCTION public.sanitize_attribution_touch(jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.sanitize_attribution_touch(jsonb) TO service_role;

-- Safe write path for authenticated buyers: verifies project ownership.
CREATE OR REPLACE FUNCTION public.save_project_attribution(
  p_project_id uuid,
  p_first jsonb,
  p_latest jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_first jsonb;
  v_latest jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT buyer_id INTO v_owner FROM public.projects WHERE id = p_project_id;
  IF v_owner IS NULL OR v_owner <> auth.uid() THEN RAISE EXCEPTION 'not_project_owner'; END IF;

  v_first  := public.sanitize_attribution_touch(p_first);
  v_latest := public.sanitize_attribution_touch(p_latest);
  IF v_first IS NULL AND v_latest IS NULL THEN RETURN; END IF;

  INSERT INTO public.project_attribution (project_id, first_touch, latest_touch)
  VALUES (p_project_id, v_first, v_latest)
  ON CONFLICT (project_id) DO UPDATE
    SET first_touch  = COALESCE(public.project_attribution.first_touch, EXCLUDED.first_touch),
        latest_touch = COALESCE(EXCLUDED.latest_touch, public.project_attribution.latest_touch),
        updated_at   = now();
END; $$;

REVOKE ALL ON FUNCTION public.save_project_attribution(uuid, jsonb, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.save_project_attribution(uuid, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_project_attribution(uuid, jsonb, jsonb) TO service_role;