CREATE OR REPLACE FUNCTION public.create_guest_project(p_email text, p_full_name text, p_company_name text, p_phone text, p_title text, p_description text, p_category text, p_budget_range text, p_start_time text, p_is_company boolean, p_source text DEFAULT 'publicera'::text)
 RETURNS TABLE(lead_id uuid, project_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_lead_id uuid; v_project_id uuid; v_title text;
BEGIN
  IF p_email IS NULL OR length(trim(p_email)) < 5 THEN RAISE EXCEPTION 'invalid_email'; END IF;
  IF p_description IS NULL OR length(trim(p_description)) < 10 THEN RAISE EXCEPTION 'invalid_brief'; END IF;
  v_title := nullif(trim(coalesce(p_title, '')), '');
  IF v_title IS NULL OR length(v_title) < 3 THEN
    v_title := left(trim(p_description), 60);
  END IF;
  INSERT INTO public.guest_leads (email, full_name, company_name, phone, title, description, category, budget_range, start_time, is_company, source)
  VALUES (lower(trim(p_email)), trim(coalesce(p_full_name, '')), nullif(trim(p_company_name), ''), nullif(trim(p_phone), ''), v_title, trim(p_description), p_category, p_budget_range, p_start_time, coalesce(p_is_company, true), coalesce(nullif(trim(p_source), ''), 'publicera'))
  RETURNING id INTO v_lead_id;
  INSERT INTO public.projects (buyer_id, guest_lead_id, title, description, category, budget_range, start_time, is_company, status)
  VALUES (NULL, v_lead_id, v_title, trim(p_description), p_category, p_budget_range, p_start_time, coalesce(p_is_company, true), 'pending')
  RETURNING id INTO v_project_id;
  RETURN QUERY SELECT v_lead_id, v_project_id;
END; $function$;