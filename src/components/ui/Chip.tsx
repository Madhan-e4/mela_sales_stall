import { cn } from "@/lib/cn";

type ChipProps = {
  selected: boolean;
  children: string;
  onClick: () => void;
};

export function Chip({ selected, children, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-[10px] px-3 text-sm font-medium transition-colors duration-150",
        selected
          ? "bg-primary-soft text-primary"
          : "border border-border bg-surface text-secondary hover:bg-background hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
