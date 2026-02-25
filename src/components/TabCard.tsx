import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Tab as TabType } from "@/types/checklist";
import ChecklistItemRow from "./ChecklistItemRow";

interface Props {
  tab: TabType;
  isEditMode: boolean;
  onToggleItem: (itemId: string, checked: boolean) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, name: string, quantity: string) => void;
  onAddItem: (tabId: string, name: string, quantity: string) => void;
  onDeleteTab: (tabId: string) => void;
  onRenameTab: (tabId: string, name: string) => void;
}

export default function TabCard({
  tab, isEditMode, onToggleItem, onDeleteItem, onUpdateItem, onAddItem, onDeleteTab, onRenameTab,
}: Props) {
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");
  const checked = tab.items.filter((i) => i.is_checked).length;
  const total = tab.items.length;
  const pct = total === 0 ? 0 : Math.round((checked / total) * 100);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddItem(tab.id, newName.trim(), newQty.trim());
    setNewName("");
    setNewQty("");
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/50 border-b border-border/50">
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <input
              className="bg-transparent border-b-2 border-dashed border-primary/50 font-bold text-sm text-foreground outline-none focus:border-primary"
              value={tab.name}
              onChange={(e) => onRenameTab(tab.id, e.target.value)}
            />
          ) : (
            <span className="font-bold text-sm text-foreground">{tab.name}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">{pct}%</span>
          {isEditMode && (
            <button onClick={() => onDeleteTab(tab.id)} className="text-destructive hover:text-destructive/80">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div>
        {tab.items.map((item) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            isEditMode={isEditMode}
            onToggle={() => onToggleItem(item.id, !item.is_checked)}
            onDelete={() => onDeleteItem(item.id)}
            onUpdate={(name, qty) => onUpdateItem(item.id, name, qty)}
          />
        ))}
      </div>

      {isEditMode && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary/30 border-t border-border/50">
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            placeholder="New item..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <input
            className="w-20 bg-transparent text-xs outline-none placeholder:text-muted-foreground/50"
            placeholder="Qty"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button onClick={handleAdd} className="text-primary hover:text-primary/80">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
