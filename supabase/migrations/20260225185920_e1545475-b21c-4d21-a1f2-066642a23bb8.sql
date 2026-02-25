-- Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE

-- checklists
DROP POLICY IF EXISTS "Users can view own checklists" ON public.checklists;
DROP POLICY IF EXISTS "Users can create own checklists" ON public.checklists;
DROP POLICY IF EXISTS "Users can update own checklists" ON public.checklists;
DROP POLICY IF EXISTS "Users can delete own checklists" ON public.checklists;

CREATE POLICY "Users can view own checklists" ON public.checklists FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own checklists" ON public.checklists FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own checklists" ON public.checklists FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own checklists" ON public.checklists FOR DELETE USING (user_id = auth.uid());

-- tabs
DROP POLICY IF EXISTS "Users can view own tabs" ON public.tabs;
DROP POLICY IF EXISTS "Users can create tabs" ON public.tabs;
DROP POLICY IF EXISTS "Users can update own tabs" ON public.tabs;
DROP POLICY IF EXISTS "Users can delete own tabs" ON public.tabs;

CREATE POLICY "Users can view own tabs" ON public.tabs FOR SELECT USING (user_owns_tab(id));
CREATE POLICY "Users can create tabs" ON public.tabs FOR INSERT WITH CHECK (user_owns_checklist(checklist_id));
CREATE POLICY "Users can update own tabs" ON public.tabs FOR UPDATE USING (user_owns_tab(id));
CREATE POLICY "Users can delete own tabs" ON public.tabs FOR DELETE USING (user_owns_tab(id));

-- items
DROP POLICY IF EXISTS "Users can view own items" ON public.items;
DROP POLICY IF EXISTS "Users can create items" ON public.items;
DROP POLICY IF EXISTS "Users can update own items" ON public.items;
DROP POLICY IF EXISTS "Users can delete own items" ON public.items;

CREATE POLICY "Users can view own items" ON public.items FOR SELECT USING (user_owns_item(id));
CREATE POLICY "Users can create items" ON public.items FOR INSERT WITH CHECK (user_owns_tab(tab_id));
CREATE POLICY "Users can update own items" ON public.items FOR UPDATE USING (user_owns_item(id));
CREATE POLICY "Users can delete own items" ON public.items FOR DELETE USING (user_owns_item(id));