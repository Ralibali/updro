ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz;

GRANT SELECT, INSERT ON public.newsletter_subscribers TO authenticated;
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT ALL ON public.newsletter_subscribers TO service_role;

DROP POLICY IF EXISTS "Admins update subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins update subscribers" ON public.newsletter_subscribers
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins delete subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins delete subscribers" ON public.newsletter_subscribers
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));