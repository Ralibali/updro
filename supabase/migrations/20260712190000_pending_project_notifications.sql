-- Notify administrators when an authenticated buyer submits a project for review.

CREATE OR REPLACE FUNCTION public.notify_admins_about_pending_project()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'pending'
     AND NEW.buyer_id IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    SELECT
      p.id,
      'new_buyer_project',
      'Nytt uppdrag väntar på granskning',
      NEW.title || ' · ' || NEW.category,
      '/admin/uppdrag'
    FROM public.profiles p
    WHERE p.role = 'admin';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_pending_project ON public.projects;
CREATE TRIGGER trg_notify_admins_pending_project
AFTER INSERT OR UPDATE OF status ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_about_pending_project();

REVOKE ALL ON FUNCTION public.notify_admins_about_pending_project()
  FROM PUBLIC, anon, authenticated;
