import type { PaymentMethod } from "@/types/sale";
import { cn } from "@/lib/cn";

export function PaymentBadge({ method }: { method: PaymentMethod }) {
  const pending = method === "Pending Payment";

  return (
    <span
      className={cn(
        "inline-flex rounded-[8px] px-2 py-0.5 text-[11px] font-medium",
        pending
          ? "bg-warning-soft text-warning"
          : "bg-[#f1f2f4] text-foreground",
      )}
    >
      {method}
    </span>
  );
}
