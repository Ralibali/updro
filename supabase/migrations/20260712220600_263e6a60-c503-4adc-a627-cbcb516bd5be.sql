
-- Tighten actual_value_sek: NULL allowed, but any provided value must be > 0 and <= 100_000_000
ALTER TABLE public.project_outcomes
  DROP CONSTRAINT IF EXISTS project_outcomes_value_chk;

ALTER TABLE public.project_outcomes
  ADD CONSTRAINT project_outcomes_value_chk
  CHECK (actual_value_sek IS NULL OR (actual_value_sek > 0 AND actual_value_sek <= 100000000));

CREATE OR REPLACE FUNCTION public.report_project_outcome(
  p_project_id uuid,
  p_outcome text,
  p_selected_offer_id uuid DEFAULT NULL,
  p_actual_value_sek numeric DEFAULT NULL,
  p_comment text DEFAULT NULL
) RETURNS public.project_outcomes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_offer_count int;
  v_offer public.offers%rowtype;
  v_supplier uuid := NULL;
  v_offer_id uuid := NULL;
  v_comment text;
  v_value numeric := NULL;
  v_row public.project_outcomes%rowtype;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF p_outcome NOT IN ('hired','still_deciding','not_proceeding') THEN
    RAISE EXCEPTION 'invalid_outcome';
  END IF;

  SELECT buyer_id INTO v_owner FROM public.projects WHERE id = p_project_id;
  IF v_owner IS NULL OR v_owner <> v_uid THEN RAISE EXCEPTION 'not_project_owner'; END IF;

  SELECT count(*) INTO v_offer_count FROM public.offers WHERE project_id = p_project_id;
  IF v_offer_count = 0 THEN RAISE EXCEPTION 'no_offers_yet'; END IF;

  IF p_outcome = 'hired' THEN
    IF p_selected_offer_id IS NULL THEN RAISE EXCEPTION 'offer_required'; END IF;
    SELECT * INTO v_offer FROM public.offers WHERE id = p_selected_offer_id;
    IF NOT FOUND OR v_offer.project_id <> p_project_id THEN
      RAISE EXCEPTION 'offer_not_in_project';
    END IF;
    v_offer_id := v_offer.id;
    v_supplier := v_offer.supplier_id;
  END IF;

  IF p_actual_value_sek IS NOT NULL THEN
    IF p_actual_value_sek <= 0 OR p_actual_value_sek > 100000000 THEN
      RAISE EXCEPTION 'invalid_value';
    END IF;
    v_value := round(p_actual_value_sek::numeric, 2);
  END IF;

  v_comment := nullif(left(trim(coalesce(p_comment, '')), 1500), '');

  INSERT INTO public.project_outcomes AS po
    (project_id, buyer_id, outcome, selected_offer_id, selected_supplier_id, actual_value_sek, comment)
  VALUES
    (p_project_id, v_uid, p_outcome, v_offer_id, v_supplier, v_value, v_comment)
  ON CONFLICT (project_id) DO UPDATE
    SET outcome              = EXCLUDED.outcome,
        selected_offer_id    = EXCLUDED.selected_offer_id,
        selected_supplier_id = EXCLUDED.selected_supplier_id,
        actual_value_sek     = EXCLUDED.actual_value_sek,
        comment              = EXCLUDED.comment,
        updated_at           = now()
  RETURNING * INTO v_row;

  BEGIN
    INSERT INTO public.audit_log (admin_id, action, target_type, target_id, details)
    VALUES (v_uid, 'report_project_outcome', 'project', p_project_id::text,
      jsonb_build_object('outcome', p_outcome, 'has_offer', v_offer_id IS NOT NULL, 'has_value', v_value IS NOT NULL));
  EXCEPTION WHEN OTHERS THEN NULL; END;

  RETURN v_row;
END;
$$;
