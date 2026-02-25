
-- Checklists table
CREATE TABLE public.checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'New Checklist',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

-- Tabs table (manufacturing days)
CREATE TABLE public.tabs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'New Tab',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tabs ENABLE ROW LEVEL SECURITY;

-- Items table
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tab_id UUID NOT NULL REFERENCES public.tabs(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  quantity TEXT DEFAULT '',
  is_checked BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION public.user_owns_checklist(p_checklist_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.checklists WHERE id = p_checklist_id AND user_id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.user_owns_tab(p_tab_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tabs t
    JOIN public.checklists c ON t.checklist_id = c.id
    WHERE t.id = p_tab_id AND c.user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.user_owns_item(p_item_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.items i
    JOIN public.tabs t ON i.tab_id = t.id
    JOIN public.checklists c ON t.checklist_id = c.id
    WHERE i.id = p_item_id AND c.user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- RLS policies for checklists
CREATE POLICY "Users can view own checklists" ON public.checklists FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own checklists" ON public.checklists FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own checklists" ON public.checklists FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own checklists" ON public.checklists FOR DELETE USING (user_id = auth.uid());

-- RLS policies for tabs
CREATE POLICY "Users can view own tabs" ON public.tabs FOR SELECT USING (public.user_owns_tab(id));
CREATE POLICY "Users can create tabs" ON public.tabs FOR INSERT WITH CHECK (public.user_owns_checklist(checklist_id));
CREATE POLICY "Users can update own tabs" ON public.tabs FOR UPDATE USING (public.user_owns_tab(id));
CREATE POLICY "Users can delete own tabs" ON public.tabs FOR DELETE USING (public.user_owns_tab(id));

-- RLS policies for items
CREATE POLICY "Users can view own items" ON public.items FOR SELECT USING (public.user_owns_item(id));
CREATE POLICY "Users can create items" ON public.items FOR INSERT WITH CHECK (public.user_owns_tab(tab_id));
CREATE POLICY "Users can update own items" ON public.items FOR UPDATE USING (public.user_owns_item(id));
CREATE POLICY "Users can delete own items" ON public.items FOR DELETE USING (public.user_owns_item(id));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON public.checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
