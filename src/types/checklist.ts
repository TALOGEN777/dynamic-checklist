export interface ChecklistItem {
  id: string;
  tab_id: string;
  name: string;
  quantity: string;
  is_checked: boolean;
  sort_order: number;
}

export interface Tab {
  id: string;
  checklist_id: string;
  name: string;
  sort_order: number;
  items: ChecklistItem[];
}

export interface Checklist {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  tabs: Tab[];
}
