import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  fetchChecklists, createChecklist, updateChecklistName, deleteChecklist, duplicateChecklist,
  createTab, updateTabName, deleteTab, createItem, updateItem, deleteItem, seedDefaultChecklist,
} from "@/lib/checklist-api";
import type { Checklist, ChecklistItem, Tab } from "@/types/checklist";
import TabBar from "@/components/TabBar";
import TabCard from "@/components/TabCard";
import {
  ClipboardCheck, Pencil, Check, RotateCcw, Plus, Trash2, ChevronDown, Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState<string | "all">("all");
  const [isEditMode, setIsEditMode] = useState(false);
  const [showChecklistMenu, setShowChecklistMenu] = useState(false);


  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ["checklists"],
    queryFn: fetchChecklists,

  });

  // Auto-seed default checklist for new users
  useEffect(() => {
    if (!isLoading && checklists.length === 0) {
      seedDefaultChecklist().then(() => queryClient.invalidateQueries({ queryKey: ["checklists"] }));
    }
  }, [isLoading, checklists.length]);

  // Auto-select first checklist
  useEffect(() => {
    if (checklists.length && !selectedChecklistId) {
      setSelectedChecklistId(checklists[0].id);
    }
  }, [checklists, selectedChecklistId]);

  const currentChecklist = checklists.find((c) => c.id === selectedChecklistId);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["checklists"] });

  const toggleItemMut = useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) => updateItem(id, { is_checked: checked }),
    onMutate: async ({ id, checked }) => {
      await queryClient.cancelQueries({ queryKey: ["checklists"] });
      const previousChecklists = queryClient.getQueryData<Checklist[]>(["checklists"]);

      // Optimistically update to the new value
      queryClient.setQueryData<Checklist[]>(["checklists"], (old) => {
        if (!old) return old;
        return old.map((checklist) => ({
          ...checklist,
          tabs: checklist.tabs.map((tab) => ({
            ...tab,
            items: tab.items.map((item) =>
              item.id === id ? { ...item, is_checked: checked } : item
            ),
          })),
        }));
      });

      // Return a context object with the snapshotted value
      return { previousChecklists };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      if (context?.previousChecklists) {
        queryClient.setQueryData(["checklists"], context.previousChecklists);
      }
      toast({ title: "Failed to update item", variant: "destructive" });
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
    },
  });

  const deleteItemMut = useMutation({ mutationFn: deleteItem, onSuccess: invalidate });
  const updateItemMut = useMutation({
    mutationFn: ({ id, name, quantity }: { id: string; name: string; quantity: string }) =>
      updateItem(id, { name, quantity }),
    onSuccess: invalidate,
  });
  const addItemMut = useMutation({
    mutationFn: ({ tabId, name, quantity }: { tabId: string; name: string; quantity: string }) =>
      createItem(tabId, name, quantity, 999),
    onSuccess: invalidate,
  });
  const deleteTabMut = useMutation({ mutationFn: deleteTab, onSuccess: invalidate });
  const renameTabMut = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateTabName(id, name),
    onSuccess: invalidate,
  });
  const addTabMut = useMutation({
    mutationFn: (name: string) => createTab(selectedChecklistId!, name, 999),
    onSuccess: invalidate,
  });

  const handleResetProgress = async () => {
    if (!currentChecklist) return;
    const allItems = currentChecklist.tabs.flatMap((t) => t.items);
    await Promise.all(allItems.map((i) => updateItem(i.id, { is_checked: false })));
    invalidate();
    toast({ title: "Progress reset" });
  };

  const handleAddChecklist = async () => {
    const name = prompt("Checklist name:");
    if (!name?.trim()) return;
    const cl = await createChecklist(name.trim());
    await invalidate();
    setSelectedChecklistId(cl.id);
  };

  const handleDeleteChecklist = async () => {
    if (!selectedChecklistId) return;
    if (!confirm("Delete this checklist?")) return;
    await deleteChecklist(selectedChecklistId);
    setSelectedChecklistId(null);
    invalidate();
  };

  const handleRenameChecklist = async () => {
    if (!currentChecklist) return;
    const name = prompt("New name:", currentChecklist.name);
    if (!name?.trim()) return;
    await updateChecklistName(currentChecklist.id, name.trim());
    invalidate();
  };

  const handleDuplicateChecklist = async () => {
    if (!selectedChecklistId) return;
    try {
      const newCl = await duplicateChecklist(selectedChecklistId);
      await invalidate();
      setSelectedChecklistId(newCl.id);
      toast({ title: "Checklist duplicated" });
    } catch {
      toast({ title: "Failed to duplicate", variant: "destructive" });
    }
  };

  const handleAddTab = () => {
    const name = prompt("Tab name (e.g. Day 14):");
    if (!name?.trim()) return;
    addTabMut.mutate(name.trim());
  };


  // Compute overall progress
  const allItems = currentChecklist?.tabs.flatMap((t) => t.items) ?? [];
  const checkedCount = allItems.filter((i) => i.is_checked).length;
  const overallPct = allItems.length === 0 ? 0 : Math.round((checkedCount / allItems.length) * 100);

  const visibleTabs = currentChecklist?.tabs.filter(
    (t) => activeTabId === "all" || t.id === activeTabId
  ) ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="container py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 shrink-0 text-primary" />
                <div className="relative">
                  <button
                    onClick={() => setShowChecklistMenu(!showChecklistMenu)}
                    className="flex items-center gap-1 text-lg font-bold text-foreground truncate"
                  >
                    {currentChecklist?.name ?? "No checklist"}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                  {showChecklistMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowChecklistMenu(false)} />
                      <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-20 py-1">
                        {checklists.map((cl) => (
                          <button
                            key={cl.id}
                            onClick={() => { setSelectedChecklistId(cl.id); setShowChecklistMenu(false); setActiveTabId("all"); }}
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors",
                              cl.id === selectedChecklistId && "bg-primary/10 text-primary font-semibold"
                            )}
                          >
                            {cl.name}
                          </button>
                        ))}
                        <div className="border-t border-border mt-1 pt-1">
                          <button
                            onClick={() => { handleAddChecklist(); setShowChecklistMenu(false); }}
                            className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-secondary flex items-center gap-2"
                          >
                            <Plus className="h-3.5 w-3.5" /> New Checklist
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* Progress */}
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden border border-border/50">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-500"
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-muted-foreground">{overallPct}%</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {isEditMode && (
                <>
                  <Button variant="ghost" size="sm" onClick={handleRenameChecklist} className="text-xs h-8">
                    Rename
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDuplicateChecklist} className="text-xs h-8">
                    <Copy className="h-3.5 w-3.5 mr-1" /> Duplicate
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDeleteChecklist} className="text-xs h-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
              <Button
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                className="h-8 text-xs"
              >
                {isEditMode ? <><Check className="h-3.5 w-3.5 mr-1" /> Done</> : <><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</>}
              </Button>
              {!isEditMode && (
                <Button variant="outline" size="sm" onClick={handleResetProgress} className="h-8 text-xs">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mt-4">
        {currentChecklist && (
          <>
            <TabBar
              tabs={currentChecklist.tabs}
              activeTabId={activeTabId}
              onSelectTab={setActiveTabId}
              isEditMode={isEditMode}
              onAddTab={handleAddTab}
            />

            <div className="space-y-4">
              {visibleTabs.map((tab) => (
                <TabCard
                  key={tab.id}
                  tab={tab}
                  isEditMode={isEditMode}
                  onToggleItem={(id, checked) => toggleItemMut.mutate({ id, checked })}
                  onDeleteItem={(id) => deleteItemMut.mutate(id)}
                  onUpdateItem={(id, name, quantity) => updateItemMut.mutate({ id, name, quantity })}
                  onAddItem={(tabId, name, quantity) => addItemMut.mutate({ tabId, name, quantity })}
                  onDeleteTab={(id) => deleteTabMut.mutate(id)}
                  onRenameTab={(id, name) => renameTabMut.mutate({ id, name })}
                />
              ))}
            </div>

            {isEditMode && (
              <button
                onClick={handleAddTab}
                className="mt-4 w-full rounded-xl border-2 border-dashed border-primary/30 py-4 text-sm font-bold text-primary hover:bg-primary/5 flex items-center justify-center gap-2 transition-colors touch-manipulation"
              >
                <Plus className="h-5 w-5" /> Add New Tab
              </button>
            )}
          </>
        )}

        {!currentChecklist && !isLoading && (
          <div className="text-center py-20">
            <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">No checklists yet</p>
            <Button onClick={handleAddChecklist}>
              <Plus className="h-4 w-4 mr-2" /> Create Checklist
            </Button>
          </div>
        )}
      </main>

      {/* Footer / End of Content */}
    </div>
  );
}
