-- Fix search_path on helper functions so auth.uid() resolves correctly

CREATE OR REPLACE FUNCTION public.user_owns_checklist(p_checklist_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (SELECT 1 FROM public.checklists WHERE id = p_checklist_id AND user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.user_owns_tab(p_tab_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tabs t
    JOIN public.checklists c ON t.checklist_id = c.id
    WHERE t.id = p_tab_id AND c.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.user_owns_item(p_item_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.items i
    JOIN public.tabs t ON i.tab_id = t.id
    JOIN public.checklists c ON t.checklist_id = c.id
    WHERE i.id = p_item_id AND c.user_id = auth.uid()
  );
$$;