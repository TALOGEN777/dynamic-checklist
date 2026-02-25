import { Check } from "lucide-react";
import type { ChecklistItem } from "@/types/checklist";
import { cn } from "@/lib/utils";

interface Props {
  item: ChecklistItem;
  isEditMode: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (name: string, quantity: string) => void;
}

export default function ChecklistItemRow({ item, isEditMode, onToggle, onDelete, onUpdate }: Props) {
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-b-0 transition-colors touch-manipulation",
        !isEditMode && "active:bg-muted/50 cursor-pointer"
      )}
      onClick={() => !isEditMode && onToggle()}
    >
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all",
          item.is_checked
            ? "border-success bg-success animate-check-bounce"
            : "border-muted-foreground/30"
        )}
      >
        {item.is_checked && <Check className="h-3.5 w-3.5 text-success-foreground" strokeWidth={3.5} />}
      </div>

      <div className="flex-1 min-w-0">
        {isEditMode ? (
          <div className="flex gap-2">
            <input
              className="flex-1 bg-transparent border-b border-dashed border-primary/40 text-sm font-semibold text-foreground outline-none focus:border-primary"
              value={item.name}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onUpdate(e.target.value, item.quantity)}
            />
            <input
              className="w-20 bg-transparent border-b border-dashed border-primary/40 text-xs text-muted-foreground outline-none focus:border-primary"
              value={item.quantity}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onUpdate(item.name, e.target.value)}
            />
          </div>
        ) : (
          <>
            <div className={cn("text-sm font-semibold", item.is_checked && "line-through text-muted-foreground/50")}>
              {renderTextWithLinks(item.name)}
            </div>
            {item.quantity && (
              <div className="text-xs text-muted-foreground">{renderTextWithLinks(item.quantity)}</div>
            )}
          </>
        )}
      </div>

      {isEditMode && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-destructive hover:text-destructive/80 text-xs font-bold shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  );
}
