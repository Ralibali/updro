ALTER TABLE public.prospecting_leads
  ADD COLUMN IF NOT EXISTS source_provider text NOT NULL DEFAULT 'firecrawl',
  ADD COLUMN IF NOT EXISTS provider_lead_id text,
  ADD COLUMN IF NOT EXISTS fit_reason text,
  ADD COLUMN IF NOT EXISTS contact_first_name text,
  ADD COLUMN IF NOT EXISTS contact_last_name text,
  ADD COLUMN IF NOT EXISTS contact_title text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS qualified_at timestamptz,
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'not_ready',
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS outreach_subject text,
  ADD COLUMN IF NOT EXISTS outreach_body text,
  ADD COLUMN IF NOT EXISTS reply_note text,
  ADD COLUMN IF NOT EXISTS export_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_exported_at timestamptz;

ALTER TABLE public.prospecting_leads
  ADD CONSTRAINT prospecting_leads_approval_status_check
  CHECK (approval_status IN ('not_ready', 'draft', 'approved', 'rejected'));

ALTER TABLE public.prospecting_campaigns
  ADD COLUMN IF NOT EXISTS source_provider text NOT NULL DEFAULT 'firecrawl';