-- Agencies were alerted when a project was *created*. At that point it is still
-- pending review, so the alert pointed at a lead the agency could not open, and
-- nothing was sent when the project was approved. Alerts were also in-app only.
--
-- This migration:
--   1. makes the agency notification feed and its bell mirror idempotent, so it
--      works whether or not 202604260002 and 202606260003 ran in this database,
--   2. alerts matching agencies when a project becomes active (once per project),
--   3. queues one e-mail per agency and project for send-supplier-lead-alerts.
--
-- Matching agencies: supplier accounts whose categories include the project's
-- category, or that have not picked any category yet.

ALTER TABLE public.supplier_profiles
  ADD COLUMN IF NOT EXISTS lead_alert_emails boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.supplier_profiles.lead_alert_emails IS
  'false = the agency asked not to receive e-mail about new leads (in-app alerts continue).';

-- 1. Agency notification feed (shown in the supplier dashboard) ------------
CREATE TABLE IF NOT EXISTS public.supplier_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'new_matching_lead',
  title text NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS supplier_notifications_supplier_idx
  ON public.supplier_notifications (supplier_id, read_at, created_at DESC);

ALTER TABLE public.supplier_notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.supplier_notifications FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.supplier_notifications TO authenticated;
GRANT UPDATE (read_at) ON public.supplier_notifications TO authenticated;
GRANT ALL ON public.supplier_notifications TO service_role;

DROP POLICY IF EXISTS "Suppliers can read own notifications" ON public.supplier_notifications;
CREATE POLICY "Suppliers can read own notifications"
  ON public.supplier_notifications FOR SELECT TO authenticated
  USING (supplier_id = auth.uid());

DROP POLICY IF EXISTS "Suppliers can update own notifications" ON public.supplier_notifications;
CREATE POLICY "Suppliers can update own notifications"
  ON public.supplier_notifications FOR UPDATE TO authenticated
  USING (supplier_id = auth.uid())
  WITH CHECK (supplier_id = auth.uid());

-- Mirror into the shared bell feed. INSERTs on public.notifications also drive
-- web push through the send-push database webhook.
CREATE OR REPLACE FUNCTION public.mirror_supplier_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    NEW.supplier_id,
    NEW.type,
    NEW.title,
    NEW.body,
    CASE
      WHEN NEW.project_id IS NOT NULL THEN '/dashboard/supplier/uppdrag/' || NEW.project_id::text
      ELSE '/dashboard/supplier'
    END
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mirror_supplier_notification ON public.supplier_notifications;
CREATE TRIGGER trg_mirror_supplier_notification
AFTER INSERT ON public.supplier_notifications
FOR EACH ROW EXECUTE FUNCTION public.mirror_supplier_notification();

REVOKE EXECUTE ON FUNCTION public.mirror_supplier_notification() FROM PUBLIC, anon, authenticated;

-- 2. E-mail queue, drained by the send-supplier-lead-alerts edge function ----
CREATE TABLE IF NOT EXISTS public.supplier_lead_alert_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.supplier_profiles(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'skipped')),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (supplier_id, project_id)
);

CREATE INDEX IF NOT EXISTS supplier_lead_alert_queue_status_idx
  ON public.supplier_lead_alert_queue (status, created_at);

ALTER TABLE public.supplier_lead_alert_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read supplier lead alerts" ON public.supplier_lead_alert_queue;
CREATE POLICY "Admins read supplier lead alerts"
  ON public.supplier_lead_alert_queue FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

REVOKE ALL ON public.supplier_lead_alert_queue FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.supplier_lead_alert_queue TO authenticated;
GRANT ALL ON public.supplier_lead_alert_queue TO service_role;

-- 3. Alert agencies when a project opens for offers -------------------------
CREATE OR REPLACE FUNCTION public.notify_matching_suppliers_for_project()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM 'active' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status IS NOT DISTINCT FROM 'active' THEN
    RETURN NEW;
  END IF;

  -- A notification problem must never block approving a project.
  BEGIN
    WITH recipients AS (
      SELECT sp.id, sp.lead_alert_emails
        FROM public.supplier_profiles sp
        JOIN public.profiles p ON p.id = sp.id AND p.role = 'supplier'
       WHERE sp.id IS DISTINCT FROM NEW.buyer_id
         AND (cardinality(coalesce(sp.categories, ARRAY[]::text[])) = 0
              OR sp.categories @> ARRAY[NEW.category])
    ), feed AS (
      INSERT INTO public.supplier_notifications (supplier_id, project_id, type, title, body)
      SELECT r.id,
             NEW.id,
             'new_matching_lead',
             'Nytt uppdrag: ' || left(NEW.title, 120),
             'Ett granskat uppdrag inom ' || coalesce(NEW.category, 'din kategori')
               || ' är öppet för offerter. Högst tre byråer kan svara.'
        FROM recipients r
       WHERE NOT EXISTS (
         SELECT 1 FROM public.supplier_notifications sn
          WHERE sn.supplier_id = r.id AND sn.project_id = NEW.id
       )
      RETURNING supplier_id
    )
    INSERT INTO public.supplier_lead_alert_queue (supplier_id, project_id)
    SELECT r.id, NEW.id
      FROM recipients r
     WHERE r.lead_alert_emails
    ON CONFLICT (supplier_id, project_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'notify_matching_suppliers_for_project(%) failed: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_matching_suppliers_for_project ON public.projects;
DROP TRIGGER IF EXISTS trg_notify_suppliers_on_project_active ON public.projects;
CREATE TRIGGER trg_notify_suppliers_on_project_active
AFTER INSERT OR UPDATE OF status ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.notify_matching_suppliers_for_project();

REVOKE EXECUTE ON FUNCTION public.notify_matching_suppliers_for_project() FROM PUBLIC, anon, authenticated;
