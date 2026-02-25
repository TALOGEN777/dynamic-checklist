import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Tab } from "@/types/checklist";

interface Props {
  tabs: Tab[];
  activeTabId: string | "all";
  onSelectTab: (id: string | "all") => void;
  isEditMode: boolean;
  onAddTab: () => void;
}

export default function TabBar({ tabs, activeTabId, onSelectTab, isEditMode, onAddTab }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-3 mb-3 border-b border-border/50 scrollbar-hide">
      <button
        onClick={() => onSelectTab("all")}
        className={cn(
          "shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium border transition-all touch-manipulation",
          activeTabId === "all"
            ? "bg-primary text-primary-foreground border-primary shadow-md"
            : "bg-card text-secondary-foreground border-border hover:bg-secondary"
        )}
      >
        All
      </button>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          className={cn(
            "shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium border transition-all touch-manipulation whitespace-nowrap",
            activeTabId === tab.id
              ? "bg-primary text-primary-foreground border-primary shadow-md"
              : "bg-card text-secondary-foreground border-border hover:bg-secondary"
          )}
        >
          {tab.name}
        </button>
      ))}
      {isEditMode && (
        <button
          onClick={onAddTab}
          className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-all touch-manipulation"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
