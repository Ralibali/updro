-- Ticket 2 (narrow): keep at most one project per guest_lead.
-- The same partial unique index was introduced in 202606252230; recreate it
-- if a later environment never applied that migration.

CREATE UNIQUE INDEX IF NOT EXISTS projects_guest_lead_id_key
  ON public.projects (guest_lead_id)
  WHERE guest_lead_id IS NOT NULL;
