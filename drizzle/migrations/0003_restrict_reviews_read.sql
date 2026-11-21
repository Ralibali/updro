DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Parties and admins read reviews" ON public.reviews FOR SELECT TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = supplier_id OR public.is_admin(auth.uid()));