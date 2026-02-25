-- Tighten public-write policies to role-scoped expressions (avoids always-true write policies)

-- checklists write policies
DROP POLICY IF EXISTS "Public can create checklists" ON public.checklists;
DROP POLICY IF EXISTS "Public can update checklists" ON public.checklists;
DROP POLICY IF EXISTS "Public can delete checklists" ON public.checklists;

CREATE POLICY "Public can create checklists"
ON public.checklists
FOR INSERT
TO public
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Public can update checklists"
ON public.checklists
FOR UPDATE
TO public
USING (auth.role() IN ('anon', 'authenticated'))
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Public can delete checklists"
ON public.checklists
FOR DELETE
TO public
USING (auth.role() IN ('anon', 'authenticated'));

-- tabs write policies
DROP POLICY IF EXISTS "Public can create tabs" ON public.tabs;
DROP POLICY IF EXISTS "Public can update tabs" ON public.tabs;
DROP POLICY IF EXISTS "Public can delete tabs" ON public.tabs;

CREATE POLICY "Public can create tabs"
ON public.tabs
FOR INSERT
TO public
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Public can update tabs"
ON public.tabs
FOR UPDATE
TO public
USING (auth.role() IN ('anon', 'authenticated'))
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Public can delete tabs"
ON public.tabs
FOR DELETE
TO public
USING (auth.role() IN ('anon', 'authenticated'));

-- items write policies
DROP POLICY IF EXISTS "Public can create items" ON public.items;
DROP POLICY IF EXISTS "Public can update items" ON public.items;
DROP POLICY IF EXISTS "Public can delete items" ON public.items;

CREATE POLICY "Public can create items"
ON public.items
FOR INSERT
TO public
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Public can update items"
ON public.items
FOR UPDATE
TO public
USING (auth.role() IN ('anon', 'authenticated'))
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Public can delete items"
ON public.items
FOR DELETE
TO public
USING (auth.role() IN ('anon', 'authenticated'));