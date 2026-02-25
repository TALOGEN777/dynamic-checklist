import { supabase } from "@/integrations/supabase/client";
import type { Checklist, Tab, ChecklistItem } from "@/types/checklist";

export async function fetchChecklists(): Promise<Checklist[]> {
  const { data: checklists, error: clErr } = await supabase
    .from("checklists")
    .select("*")
    .order("created_at", { ascending: true });
  if (clErr) throw clErr;
  if (!checklists?.length) return [];

  const checklistIds = checklists.map((c) => c.id);
  const { data: tabs, error: tabErr } = await supabase
    .from("tabs")
    .select("*")
    .in("checklist_id", checklistIds)
    .order("sort_order", { ascending: true });
  if (tabErr) throw tabErr;

  const tabIds = (tabs || []).map((t) => t.id);
  let items: any[] = [];
  if (tabIds.length) {
    const { data, error: itemErr } = await supabase
      .from("items")
      .select("*")
      .in("tab_id", tabIds)
      .order("sort_order", { ascending: true });
    if (itemErr) throw itemErr;
    items = data || [];
  }

  return checklists.map((cl) => ({
    ...cl,
    description: cl.description || "",
    tabs: (tabs || [])
      .filter((t) => t.checklist_id === cl.id)
      .map((t) => ({
        ...t,
        items: items.filter((i) => i.tab_id === t.id),
      })),
  }));
}

export async function createChecklist(userId: string, name: string) {
  const { data, error } = await supabase
    .from("checklists")
    .insert({ user_id: userId, name })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateChecklistName(id: string, name: string) {
  const { error } = await supabase.from("checklists").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function deleteChecklist(id: string) {
  const { error } = await supabase.from("checklists").delete().eq("id", id);
  if (error) throw error;
}

export async function createTab(checklistId: string, name: string, sortOrder: number) {
  const { data, error } = await supabase
    .from("tabs")
    .insert({ checklist_id: checklistId, name, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTabName(id: string, name: string) {
  const { error } = await supabase.from("tabs").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function deleteTab(id: string) {
  const { error } = await supabase.from("tabs").delete().eq("id", id);
  if (error) throw error;
}

export async function createItem(tabId: string, name: string, quantity: string, sortOrder: number) {
  const { data, error } = await supabase
    .from("items")
    .insert({ tab_id: tabId, name, quantity, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateItem(id: string, updates: Partial<{ name: string; quantity: string; is_checked: boolean }>) {
  const { error } = await supabase.from("items").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}

// Seed the CD19 default checklist for a new user
export async function seedDefaultChecklist(userId: string) {
  const cl = await createChecklist(userId, "CD19 CAR-T Manufacturing");

  const days = [
    { name: "Day 0", items: [
      { name: "AIM-V Medium", qty: "1x1L" },
      { name: "Penicillin/Streptomycin", qty: "1x20ml" },
      { name: "L-Glutamine Solution 200mM", qty: "1x20ml" },
      { name: "Human male AB PD Serum (Heat Inactivated)", qty: "1x100ml" },
      { name: "DPBS-Dulbecco's Phosphate Buffer Saline", qty: "2x500ml" },
      { name: "Lymphoprep (Ficoll)", qty: "1x500ml" },
      { name: "OKT-3 (MACS GMP CD3) 1mg/mL", qty: "1xAliquot" },
      { name: "IL-2 (Proleukin) 3.6x10^6 IU/mL", qty: "1xAliquot" },
      { name: "CryoStor® CS10 (16mL)", qty: "1xUnit" },
    ]},
    { name: "Day 1", items: [
      { name: "RetroNectin GMP grade (10µg/mL, 1:100)", qty: "1xAliquot" },
      { name: "Human albumin 20%", qty: "1xUnit" },
    ]},
    { name: "Day 2", items: [
      { name: "CD19 Viral Vector", qty: "1xAliquot" },
      { name: "IL-2 (Proleukin) 3.6x10^6 IU/mL", qty: "1xAliquot" },
      { name: "STIM medium", qty: "1xUnit" },
    ]},
    { name: "Day 3", items: [
      { name: "6-well plates", qty: "2xUnits" },
      { name: "0.5M EDTA solution", qty: "1xAliquot" },
      { name: "STIM medium", qty: "1xUnit" },
    ]},
    { name: "Day 6", items: [
      { name: "AIM-V Medium", qty: "1x1L" },
      { name: "Serum", qty: "1xUnit" },
      { name: "Penicillin/Streptomycin", qty: "1x20ml" },
      { name: "L-Glutamine Solution 200mM", qty: "1x20ml" },
      { name: "IL-2 (Proleukin) 3.6x10^6 IU/mL", qty: "1xAliquot" },
    ]},
    { name: "Day 10", items: [
      { name: "AIM-V Medium", qty: "1x1L" },
      { name: "Serum", qty: "1xUnit" },
      { name: "Penicillin/Streptomycin", qty: "1x20ml" },
      { name: "L-Glutamine Solution 200mM", qty: "1x20ml" },
      { name: "IL-2 (Proleukin) 3.6x10^6 IU/mL", qty: "1xAliquot" },
    ]},
  ];

  for (let i = 0; i < days.length; i++) {
    const tab = await createTab(cl.id, days[i].name, i);
    for (let j = 0; j < days[i].items.length; j++) {
      await createItem(tab.id, days[i].items[j].name, days[i].items[j].qty, j);
    }
  }
}
