DROP POLICY IF EXISTS "Buyer inserts own project attribution" ON public.project_attributions;
CREATE POLICY "Buyer inserts own project attribution"
  ON public.project_attributions
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_attributions.project_id AND p.buyer_id = auth.uid()
  ));