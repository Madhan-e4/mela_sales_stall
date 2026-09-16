import type { ReactNode } from "react";
import { formatInr } from "@/lib/inventory";

type CheckoutBarProps = {
  amount: number;
  children: ReactNode;
};

export function CheckoutBar({ amount, children }: CheckoutBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <p className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
            Final Amount
          </span>
          <span className="mt-0.5 block text-[22px] font-semibold tracking-tight tabular-nums text-foreground">
            {formatInr(amount)}
          </span>
        </p>
        {children}
      </div>
    </div>
  );
}
