
-- prospecting_campaigns
CREATE TABLE IF NOT EXISTS public.prospecting_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  query text NOT NULL,
  location text NOT NULL DEFAULT 'Sweden',
  need_type text NOT NULL DEFAULT 'valfritt' CHECK (need_type IN ('webb','ehandel','ai','valfritt')),
  industry text,
  result_limit integer NOT NULL DEFAULT 10 CHECK (result_limit BETWEEN 1 AND 20),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','running','completed','failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prospecting_campaigns TO authenticated;
GRANT ALL ON public.prospecting_campaigns TO service_role;

ALTER TABLE public.prospecting_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage prospecting campaigns" ON public.prospecting_campaigns;
CREATE POLICY "Admins manage prospecting campaigns"
  ON public.prospecting_campaigns
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS prospecting_campaigns_set_updated_at ON public.prospecting_campaigns;
CREATE TRIGGER prospecting_campaigns_set_updated_at
  BEFORE UPDATE ON public.prospecting_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_prospecting_campaigns_admin ON public.prospecting_campaigns(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prospecting_campaigns_status ON public.prospecting_campaigns(status);

-- prospecting_leads
CREATE TABLE IF NOT EXISTS public.prospecting_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.prospecting_campaigns(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  domain text NOT NULL,
  website_url text NOT NULL,
  source_url text NOT NULL,
  city text,
  industry text,
  description text,
  fit_score integer NOT NULL DEFAULT 0 CHECK (fit_score BETWEEN 0 AND 100),
  observed_signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  contact_page_url text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewed','contacted','replied','qualified','converted','rejected','do_not_contact')),
  outreach_note text,
  contacted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, domain)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prospecting_leads TO authenticated;
GRANT ALL ON public.prospecting_leads TO service_role;

ALTER TABLE public.prospecting_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage prospecting leads" ON public.prospecting_leads;
CREATE POLICY "Admins manage prospecting leads"
  ON public.prospecting_leads
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS prospecting_leads_set_updated_at ON public.prospecting_leads;
CREATE TRIGGER prospecting_leads_set_updated_at
  BEFORE UPDATE ON public.prospecting_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_prospecting_leads_campaign ON public.prospecting_leads(campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prospecting_leads_status ON public.prospecting_leads(status);
CREATE INDEX IF NOT EXISTS idx_prospecting_leads_score ON public.prospecting_leads(fit_score DESC);
CREATE INDEX IF NOT EXISTS idx_prospecting_leads_domain ON public.prospecting_leads(domain);
