
-- 1. guest_leads
CREATE TABLE IF NOT EXISTS public.guest_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  company_name text,
  phone text,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  budget_range text NOT NULL,
  start_time text NOT NULL,
  is_company boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'publicera',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guest_leads_email_created ON public.guest_leads (email, created_at DESC);

GRANT SELECT ON public.guest_leads TO authenticated;
GRANT ALL ON public.guest_leads TO service_role;

ALTER TABLE public.guest_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read guest leads"
  ON public.guest_leads FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 2. projects: make buyer_id nullable and add guest_lead_id
ALTER TABLE public.projects
  ALTER COLUMN buyer_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS guest_lead_id uuid REFERENCES public.guest_leads(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_guest_lead_id ON public.projects (guest_lead_id);

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_owner_or_guest_chk,
  ADD CONSTRAINT projects_owner_or_guest_chk
    CHECK ((buyer_id IS NOT NULL AND guest_lead_id IS NULL)
        OR (buyer_id IS NULL AND guest_lead_id IS NOT NULL));

-- 3. Patch close_project_on_max_offers to skip notification for guest projects
CREATE OR REPLACE FUNCTION public.close_project_on_max_offers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_max int;
  v_count int;
  v_buyer_id uuid;
  v_title text;
BEGIN
  SELECT max_offers, buyer_id, title INTO v_max, v_buyer_id, v_title
  FROM public.projects WHERE id = NEW.project_id;

  v_max := COALESCE(v_max, 5);

  SELECT count(*) INTO v_count FROM public.offers WHERE project_id = NEW.project_id;

  IF v_count >= v_max THEN
    UPDATE public.projects SET status = 'closed' WHERE id = NEW.project_id;

    IF v_buyer_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, link)
      VALUES (
        v_buyer_id,
        'project_closed',
        'Ditt uppdrag har fått max antal offerter',
        '"' || v_title || '" har nu ' || v_count || ' offerter och är stängt för nya svar.',
        '/dashboard/buyer/uppdrag/' || NEW.project_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 4. guest_offer_email_queue
CREATE TABLE IF NOT EXISTS public.guest_offer_email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL UNIQUE REFERENCES public.offers(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  guest_lead_id uuid NOT NULL REFERENCES public.guest_leads(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','skipped')),
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guest_offer_queue_status_created
  ON public.guest_offer_email_queue (status, created_at);

GRANT SELECT ON public.guest_offer_email_queue TO authenticated;
GRANT ALL ON public.guest_offer_email_queue TO service_role;

ALTER TABLE public.guest_offer_email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read guest offer email queue"
  ON public.guest_offer_email_queue FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.set_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guest_offer_queue_updated ON public.guest_offer_email_queue;
CREATE TRIGGER trg_guest_offer_queue_updated
  BEFORE UPDATE ON public.guest_offer_email_queue
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();

-- 5. Trigger on offers-insert: enqueue mail for guest projects
CREATE OR REPLACE FUNCTION public.enqueue_guest_offer_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_guest_lead_id uuid;
  v_buyer_id uuid;
BEGIN
  SELECT buyer_id, guest_lead_id INTO v_buyer_id, v_guest_lead_id
  FROM public.projects
  WHERE id = NEW.project_id;

  IF v_buyer_id IS NULL AND v_guest_lead_id IS NOT NULL THEN
    INSERT INTO public.guest_offer_email_queue (offer_id, project_id, guest_lead_id)
    VALUES (NEW.id, NEW.project_id, v_guest_lead_id)
    ON CONFLICT (offer_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_offers_enqueue_guest_email ON public.offers;
CREATE TRIGGER trg_offers_enqueue_guest_email
  AFTER INSERT ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_guest_offer_email();
