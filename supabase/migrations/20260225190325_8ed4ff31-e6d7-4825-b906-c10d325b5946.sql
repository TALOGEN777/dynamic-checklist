-- Remove user-bound requirement so app can run without authentication
ALTER TABLE public.checklists
ALTER COLUMN user_id DROP NOT NULL;

-- Recreate RLS policies as shared/public access
-- checklists
DROP POLICY IF EXISTS "Users can view own checklists" ON public.checklists;
DROP POLICY IF EXISTS "Users can create own checklists" ON public.checklists;
DROP POLICY IF EXISTS "Users can update own checklists" ON public.checklists;
DROP POLICY IF EXISTS "Users can delete own checklists" ON public.checklists;

CREATE POLICY "Public can view checklists"
ON public.checklists
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can create checklists"
ON public.checklists
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public can update checklists"
ON public.checklists
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete checklists"
ON public.checklists
FOR DELETE
TO public
USING (true);

-- tabs
DROP POLICY IF EXISTS "Users can view own tabs" ON public.tabs;
DROP POLICY IF EXISTS "Users can create tabs" ON public.tabs;
DROP POLICY IF EXISTS "Users can update own tabs" ON public.tabs;
DROP POLICY IF EXISTS "Users can delete own tabs" ON public.tabs;

CREATE POLICY "Public can view tabs"
ON public.tabs
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can create tabs"
ON public.tabs
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public can update tabs"
ON public.tabs
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete tabs"
ON public.tabs
FOR DELETE
TO public
USING (true);

-- items
DROP POLICY IF EXISTS "Users can view own items" ON public.items;
DROP POLICY IF EXISTS "Users can create items" ON public.items;
DROP POLICY IF EXISTS "Users can update own items" ON public.items;
DROP POLICY IF EXISTS "Users can delete own items" ON public.items;

CREATE POLICY "Public can view items"
ON public.items
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can create items"
ON public.items
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public can update items"
ON public.items
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete items"
ON public.items
FOR DELETE
TO public
USING (true);