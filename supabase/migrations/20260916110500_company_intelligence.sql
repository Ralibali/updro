-- Store deterministic company-level enrichment produced from the same public
-- Firecrawl result already used by prospecting. No additional personal data is collected.
ALTER TABLE public.prospecting_leads
  ADD COLUMN IF NOT EXISTS company_intelligence jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS intelligence_source text,
  ADD COLUMN IF NOT EXISTS intelligence_updated_at timestamptz;

COMMENT ON COLUMN public.prospecting_leads.company_intelligence IS
  'Deterministic public-company signals used for admin review and lead qualification.';
COMMENT ON COLUMN public.prospecting_leads.intelligence_source IS
  'Source pipeline/version for company_intelligence, e.g. firecrawl-search-v1.';
COMMENT ON COLUMN public.prospecting_leads.intelligence_updated_at IS
  'Timestamp when company_intelligence was last generated.';
