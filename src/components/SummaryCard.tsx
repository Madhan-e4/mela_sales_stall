import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card } from "./ui/Card";

type SummaryCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "warning";
};

export function SummaryCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: SummaryCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-secondary">{label}</p>
        {icon ? (
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-[10px]",
              tone === "warning"
                ? "bg-warning-soft text-warning"
                : "bg-primary-soft text-primary",
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "mt-3 text-[22px] font-semibold tracking-tight tabular-nums",
          tone === "warning" ? "text-warning" : "text-foreground",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </Card>
  );
}
