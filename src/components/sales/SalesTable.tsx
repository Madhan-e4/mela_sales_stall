"use client";

import type { Sale } from "@/types/sale";
import { formatInr } from "@/lib/inventory";
import {
  formatItemCount,
  formatSaleDate,
  getItemCount,
} from "@/lib/salesHistory";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Table, THead, TH, TR, TD } from "@/components/ui/Table";
import { PaymentBadge } from "./PaymentBadge";

type SalesTableProps = {
  sales: Sale[];
  onView: (sale: Sale) => void;
};

export function SalesTable({ sales, onView }: SalesTableProps) {
  return (
    <Table minWidthClassName="min-w-[52rem]">
      <THead>
        <tr>
          <TH>Sale ID</TH>
          <TH>Date</TH>
          <TH align="right">Items</TH>
          <TH align="right">Amount</TH>
          <TH>Payment</TH>
          <TH>Customer Phone</TH>
          <TH align="right">Actions</TH>
        </tr>
      </THead>
      <tbody>
        {sales.map((sale) => {
          const pending = sale.paymentMethod === "Pending Payment";

          return (
            <TR key={sale.saleId} highlight={pending}>
              <TD className="font-medium text-foreground">{sale.saleId}</TD>
              <TD className="text-secondary">{formatSaleDate(sale.createdAt)}</TD>
              <TD align="right" numeric>
                {formatItemCount(getItemCount(sale))}
              </TD>
              <TD align="right" numeric className="font-medium">
                {formatInr(sale.finalAmount)}
              </TD>
              <TD>
                <PaymentBadge method={sale.paymentMethod} />
              </TD>
              <TD className="text-secondary">
                {sale.customerPhone || "—"}
              </TD>
              <TD align="right">
                <div className="inline-flex items-center justify-end gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => onView(sale)}
                  >
                    View
                  </Button>
                  <ButtonLink
                    href={`/sales/${sale.saleId}/edit`}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                  >
                    Edit
                  </ButtonLink>
                </div>
              </TD>
            </TR>
          );
        })}
      </tbody>
    </Table>
  );
}
