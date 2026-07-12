-- Product reliability: rate limiting, verified guest claims, Stripe idempotency and offer limits.

CREATE TABLE IF NOT EXISTS public.edge_rate_limits (
  rate_key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.edge_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edge_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.edge_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_edge_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allowed boolean;
BEGIN
  IF p_key IS NULL OR length(trim(p_key)) < 3 OR p_limit < 1 OR p_window_seconds < 1 THEN
    RETURN false;
  END IF;

  INSERT INTO public.edge_rate_limits (rate_key, window_start, request_count, updated_at)
  VALUES (trim(p_key), now(), 1, now())
  ON CONFLICT (rate_key) DO UPDATE
  SET request_count = CASE
        WHEN edge_rate_limits.window_start <= now() - make_interval(secs => p_window_seconds)
          THEN 1
        ELSE edge_rate_limits.request_count + 1
      END,
      window_start = CASE
        WHEN edge_rate_limits.window_start <= now() - make_interval(secs => p_window_seconds)
          THEN now()
        ELSE edge_rate_limits.window_start
      END,
      updated_at = now()
  RETURNING request_count <= p_limit INTO v_allowed;

  RETURN coalesce(v_allowed, false);
END;
$$;

REVOKE ALL ON FUNCTION public.consume_edge_rate_limit(text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_edge_rate_limit(text, integer, integer)
  TO service_role;

-- Guest projects are claimed only after the buyer has a verified authenticated session.
CREATE OR REPLACE FUNCTION public.claim_guest_projects()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_role text;
  v_claimed integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  v_email := lower(nullif(trim(auth.jwt() ->> 'email'), ''));
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'verified_email_missing';
  END IF;

  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_role IS DISTINCT FROM 'buyer' THEN
    RETURN 0;
  END IF;

  UPDATE public.projects p
  SET buyer_id = auth.uid(),
      guest_lead_id = NULL,
      email_verified = true,
      updated_at = now()
  WHERE p.buyer_id IS NULL
    AND p.guest_lead_id IN (
      SELECT gl.id
      FROM public.guest_leads gl
      WHERE lower(gl.email) = v_email
    );

  GET DIAGNOSTICS v_claimed = ROW_COUNT;
  RETURN v_claimed;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_guest_projects() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_guest_projects() TO authenticated;

-- Both the checkout return and Stripe webhook use checkout_session:<session-id>.
-- Clean any historic duplicates before enforcing uniqueness.
WITH ranked AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY stripe_event_id
           ORDER BY created_at ASC NULLS LAST, id
         ) AS row_number
  FROM public.stripe_events
)
DELETE FROM public.stripe_events se
USING ranked r
WHERE se.id = r.id
  AND r.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS stripe_events_stripe_event_id_unique
  ON public.stripe_events (stripe_event_id);

-- Product promise: no more than three competing offers per assignment.
ALTER TABLE public.projects
  ALTER COLUMN max_offers SET DEFAULT 3;

UPDATE public.projects
SET max_offers = 3
WHERE status IN ('pending', 'active')
  AND (max_offers IS NULL OR max_offers > 3);
