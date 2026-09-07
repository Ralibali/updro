-- Integrate delivery planning into the server-owned agreement snapshot.
-- The previous five-argument call remains usable through the new default arg.
CREATE OR REPLACE FUNCTION public.normalize_agreement_delivery_plan(p_plan jsonb)
RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_items jsonb := '[]'::jsonb; v_item jsonb; v_date date; v_rounds numeric; v_criteria text;
BEGIN
  IF p_plan IS NULL OR p_plan = 'null'::jsonb THEN
    RETURN jsonb_build_object('deliverables', '[]'::jsonb, 'due_date', NULL, 'revision_rounds', NULL, 'acceptance_criteria', '');
  END IF;
  IF jsonb_typeof(p_plan) IS DISTINCT FROM 'object' OR
    NOT (p_plan ?& ARRAY['deliverables', 'due_date', 'revision_rounds', 'acceptance_criteria']) OR
    jsonb_typeof(p_plan->'deliverables') IS DISTINCT FROM 'array' OR
    jsonb_typeof(p_plan->'acceptance_criteria') IS DISTINCT FROM 'string' THEN
    RAISE EXCEPTION 'Ogiltig leveransplan.';
  END IF;
  IF jsonb_array_length(p_plan->'deliverables') > 20 THEN RAISE EXCEPTION 'Ange högst 20 leveranser.'; END IF;
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_plan->'deliverables') LOOP
    IF jsonb_typeof(v_item) IS DISTINCT FROM 'string' OR length(btrim(v_item #>> '{}')) NOT BETWEEN 1 AND 200 THEN
      RAISE EXCEPTION 'Varje leverans ska innehålla 1–200 tecken.';
    END IF;
    v_items := v_items || jsonb_build_array(btrim(v_item #>> '{}'));
  END LOOP;
  IF p_plan->'due_date' <> 'null'::jsonb THEN
    IF jsonb_typeof(p_plan->'due_date') IS DISTINCT FROM 'string' OR (p_plan->>'due_date') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
      RAISE EXCEPTION 'Ange ett giltigt leveransdatum.';
    END IF;
    BEGIN
      v_date := (p_plan->>'due_date')::date;
    EXCEPTION WHEN OTHERS THEN RAISE EXCEPTION 'Ange ett giltigt leveransdatum.';
    END;
  END IF;
  IF p_plan->'revision_rounds' <> 'null'::jsonb THEN
    IF jsonb_typeof(p_plan->'revision_rounds') IS DISTINCT FROM 'number' THEN RAISE EXCEPTION 'Ange 0–20 hela korrekturrundor.'; END IF;
    v_rounds := (p_plan->>'revision_rounds')::numeric;
    IF v_rounds < 0 OR v_rounds > 20 OR v_rounds <> trunc(v_rounds) THEN RAISE EXCEPTION 'Ange 0–20 hela korrekturrundor.'; END IF;
  END IF;
  v_criteria := p_plan->>'acceptance_criteria';
  IF length(v_criteria) > 2000 THEN RAISE EXCEPTION 'Godkännandekriterier får innehålla högst 2 000 tecken.'; END IF;
  RETURN jsonb_build_object('deliverables', v_items, 'due_date', v_date, 'revision_rounds', v_rounds::integer, 'acceptance_criteria', v_criteria);
END; $$;
REVOKE ALL ON FUNCTION public.normalize_agreement_delivery_plan(jsonb) FROM PUBLIC, anon, authenticated;

DROP FUNCTION public.update_project_agreement(uuid,text,integer,text,text);
CREATE OR REPLACE FUNCTION public.update_project_agreement(
  p_offer_id uuid, p_action text, p_expected_revision integer DEFAULT 0,
  p_scope text DEFAULT NULL, p_special_terms text DEFAULT NULL, p_delivery_plan jsonb DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_offer public.offers%rowtype; v_project public.projects%rowtype;
  v_agreement public.project_agreements%rowtype; v_context jsonb; v_content jsonb;
  v_buyer boolean; v_target uuid; v_action text; v_plan jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Du måste vara inloggad.'; END IF;
  IF p_action IS NULL OR p_action NOT IN ('create', 'edit', 'confirm') THEN RAISE EXCEPTION 'Ogiltig avtalsåtgärd.'; END IF;
  SELECT * INTO v_offer FROM public.offers WHERE id = p_offer_id;
  SELECT * INTO v_project FROM public.projects WHERE id = v_offer.project_id FOR UPDATE;
  v_context := public.get_project_agreement(v_project.id, p_offer_id)->'context';
  v_buyer := auth.uid() = v_project.buyer_id;
  SELECT * INTO v_agreement FROM public.project_agreements WHERE offer_id = p_offer_id FOR UPDATE;
  IF p_action = 'create' THEN
    IF v_buyer IS DISTINCT FROM true THEN RAISE EXCEPTION 'Beställaren skapar avtalet.'; END IF;
    IF v_agreement.id IS NOT NULL THEN RETURN to_jsonb(v_agreement); END IF;
    v_content := jsonb_build_object('version', 2, 'delivery_plan', public.normalize_agreement_delivery_plan(NULL),
      'scope', v_offer.title || E'\n\n' || v_offer.description, 'special_terms', '',
      'price_sek', v_offer.price, 'payment_plan', coalesce(v_offer.payment_plan, 'fixed'),
      'delivery_weeks', v_offer.delivery_weeks, 'project_title', v_project.title, 'offer_title', v_offer.title,
      'buyer_name', v_context->>'buyerName', 'supplier_name', v_context->>'supplierName',
      'created_at', now(), 'buyer_confirmed_at', NULL, 'supplier_confirmed_at', NULL,
      'standard_clauses', jsonb_build_array(
        'Priset avser det angivna omfånget. Ändringar eller tillägg avtalas skriftligen mellan parterna innan arbetet påbörjas.',
        'Moms tillkommer om inte annat anges.',
        'Parterna kommunicerar via Updros meddelandefunktion eller direkt via de kontaktuppgifter som delats.',
        'Eventuella tvister löses i första hand direkt mellan parterna. Updro är inte part i detta avtal och ansvarar inte för leveransen.'));
    INSERT INTO public.project_agreements(project_id, offer_id, buyer_id, supplier_id, content)
    VALUES(v_project.id, v_offer.id, v_project.buyer_id, v_offer.supplier_id, v_content) RETURNING * INTO v_agreement;
    v_action := 'create';
  ELSE
    IF v_agreement.id IS NULL THEN RAISE EXCEPTION 'Beställaren behöver först skapa avtalet.'; END IF;
    IF v_agreement.revision IS DISTINCT FROM p_expected_revision THEN
      RAISE EXCEPTION 'Avtalet har ändrats. Ladda om och granska den senaste versionen.';
    END IF;
    IF v_agreement.content->>'supplier_confirmed_at' IS NOT NULL THEN
      RAISE EXCEPTION 'Avtalet är bekräftat av båda parter och låst.';
    END IF;
    v_content := v_agreement.content;
    IF p_action = 'edit' THEN
      IF v_buyer IS DISTINCT FROM true THEN RAISE EXCEPTION 'Bara beställaren kan redigera avtalsutkastet.'; END IF;
      IF length(btrim(coalesce(p_scope, ''))) NOT BETWEEN 3 AND 30000 OR length(coalesce(p_special_terms, '')) > 10000 THEN
        RAISE EXCEPTION 'Ange omfattning (3–30 000 tecken) och högst 10 000 tecken särskilda villkor.';
      END IF;
      v_plan := public.normalize_agreement_delivery_plan(coalesce(p_delivery_plan, v_content->'delivery_plan'));
      IF v_content->>'scope' = btrim(p_scope) AND v_content->>'special_terms' = btrim(coalesce(p_special_terms, ''))
        AND coalesce(v_content->'delivery_plan', public.normalize_agreement_delivery_plan(NULL)) = v_plan THEN
        RETURN to_jsonb(v_agreement);
      END IF;
      v_content := v_content || jsonb_build_object('version', 2, 'delivery_plan', v_plan, 'scope', btrim(p_scope), 'special_terms', btrim(coalesce(p_special_terms, '')),
        'buyer_confirmed_at', NULL, 'supplier_confirmed_at', NULL);
      v_action := 'edit';
    ELSIF v_buyer THEN
      IF v_content->>'buyer_confirmed_at' IS NOT NULL THEN RETURN to_jsonb(v_agreement); END IF;
      v_content := v_content || jsonb_build_object('buyer_confirmed_at', now());
      v_action := 'buyer_confirm';
    ELSE
      IF v_content->>'buyer_confirmed_at' IS NULL THEN RAISE EXCEPTION 'Beställaren behöver bekräfta avtalet först.'; END IF;
      v_content := v_content || jsonb_build_object('supplier_confirmed_at', now());
      v_action := 'supplier_confirm';
    END IF;
    UPDATE public.project_agreements SET content = v_content, revision = revision + 1, updated_at = now()
    WHERE id = v_agreement.id RETURNING * INTO v_agreement;
    v_target := CASE WHEN v_buyer THEN v_offer.supplier_id ELSE v_project.buyer_id END;
    INSERT INTO public.notifications(user_id, type, title, message, link)
    VALUES(v_target, 'agreement_update', CASE v_action
      WHEN 'edit' THEN 'Samarbetsavtalet har ändrats'
      WHEN 'buyer_confirm' THEN 'Samarbetsavtal att bekräfta'
      ELSE 'Byrån har bekräftat avtalet' END,
      'Öppna avtalet för "' || v_project.title || '" och granska den aktuella versionen.',
      CASE WHEN v_buyer THEN '/dashboard/supplier/offerter' ELSE '/dashboard/buyer/uppdrag/' || v_project.id END);
  END IF;
  INSERT INTO public.project_agreement_events(agreement_id, revision, actor_id, action, content)
  VALUES(v_agreement.id, v_agreement.revision, auth.uid(), v_action, v_agreement.content);
  RETURN to_jsonb(v_agreement);
END; $$;
REVOKE ALL ON FUNCTION public.update_project_agreement(uuid,text,integer,text,text,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_project_agreement(uuid,text,integer,text,text,jsonb) TO authenticated;
NOTIFY pgrst, 'reload schema';
