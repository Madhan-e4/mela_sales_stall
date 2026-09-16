import type { Product } from "@/types/product";
import type { Sale } from "@/types/sale";
import { displaySubType, formatInr } from "@/lib/inventory";
import { formatSaleDateTime, getSaleItemDisplay } from "@/lib/salesHistory";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, TH, TR, TD } from "@/components/ui/Table";
import { PaymentBadge } from "./PaymentBadge";

type SaleDetailsPanelProps = {
  sale: Sale;
  productsById: Map<string, Product>;
  onMarkAsPaid?: () => void;
};

export function SaleDetailsPanel({
  sale,
  productsById,
  onMarkAsPaid,
}: SaleDetailsPanelProps) {
  const pending = sale.paymentMethod === "Pending Payment";

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
          {sale.saleId}
        </h2>
        <p className="text-sm text-secondary">
          {formatSaleDateTime(sale.createdAt)}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-[13px] font-medium text-foreground">Items</h3>
        <Table minWidthClassName="min-w-[44rem]">
          <THead>
            <tr>
              <TH>Product</TH>
              <TH>Sub-Type</TH>
              <TH align="right">Qty</TH>
              <TH align="right">Catalogue Price</TH>
              <TH align="right">Actual Price</TH>
              <TH align="right">Discount</TH>
              <TH align="right">Total</TH>
            </tr>
          </THead>
          <tbody>
            {sale.items.map((item) => {
              const product = productsById.get(item.productId);
              const display = getSaleItemDisplay(item, product);

              return (
                <TR key={`${sale.saleId}-${item.productId}`}>
                  <TD className="font-medium text-foreground">{display.type}</TD>
                  <TD className="text-secondary">
                    {displaySubType(display.subType)}
                  </TD>
                  <TD align="right" numeric>
                    {item.quantity}
                  </TD>
                  <TD align="right" numeric>
                    {formatInr(item.cataloguePrice)}
                  </TD>
                  <TD align="right" numeric>
                    {formatInr(item.actualSellingPrice)}
                  </TD>
                  <TD align="right" numeric>
                    {formatInr(item.discount)}
                  </TD>
                  <TD align="right" numeric className="font-medium">
                    {formatInr(item.lineTotal)}
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </section>

      <section className="space-y-3">
        <h3 className="text-[13px] font-medium text-foreground">Totals</h3>
        <Card className="p-4">
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-secondary">Subtotal</dt>
              <dd className="tabular-nums text-foreground">
                {formatInr(sale.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary">Total Discount</dt>
              <dd className="tabular-nums text-foreground">
                {formatInr(sale.totalDiscount)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <dt className="font-medium text-foreground">Final Amount</dt>
              <dd className="text-[17px] font-semibold tabular-nums text-foreground">
                {formatInr(sale.finalAmount)}
              </dd>
            </div>
          </dl>
        </Card>
      </section>

      <section className="space-y-3">
        <h3 className="text-[13px] font-medium text-foreground">Payment</h3>
        <div className="flex flex-wrap items-center gap-3">
          <PaymentBadge method={sale.paymentMethod} />
          {pending && onMarkAsPaid ? (
            <Button size="sm" onClick={onMarkAsPaid}>
              Mark as Paid
            </Button>
          ) : null}
        </div>
        {sale.paymentMethod === "GPay" && sale.customerPhone ? (
          <p className="text-sm text-secondary">Phone: {sale.customerPhone}</p>
        ) : null}
      </section>
    </div>
  );
}
