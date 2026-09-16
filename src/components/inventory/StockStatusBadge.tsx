import type { StockStatus } from "@/types/product";
import { cn } from "@/lib/cn";

const STATUS_STYLES: Record<StockStatus, string> = {
  "In Stock": "bg-success-soft text-success",
  "Low Stock": "bg-warning-soft text-warning",
  "Out of Stock": "bg-danger-soft text-danger",
};

const STATUS_DOT: Record<StockStatus, string> = {
  "In Stock": "bg-success",
  "Low Stock": "bg-warning",
  "Out of Stock": "bg-danger",
};

export function StockStatusBadge({ status }: { status: StockStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[8px] px-2 py-0.5 text-[11px] font-medium",
        STATUS_STYLES[status],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
      {status}
    </span>
  );
}
