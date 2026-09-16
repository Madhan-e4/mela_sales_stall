import { formatInr } from "@/lib/inventory";
import { Card } from "@/components/ui/Card";

type SaleSummaryProps = {
  subtotal: number;
  totalDiscount: number;
  finalAmount: number;
};

export function SaleSummary({
  subtotal,
  totalDiscount,
  finalAmount,
}: SaleSummaryProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-[13px] font-medium text-foreground">Totals</h2>
      <Card className="p-4">
        <dl className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-secondary">Subtotal</dt>
            <dd className="tabular-nums text-foreground">{formatInr(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-secondary">Total Discount</dt>
            <dd className="tabular-nums text-foreground">
              {formatInr(totalDiscount)}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <dt className="font-medium text-foreground">Final Amount</dt>
            <dd className="text-[17px] font-semibold tabular-nums text-foreground">
              {formatInr(finalAmount)}
            </dd>
          </div>
        </dl>
      </Card>
    </section>
  );
}
