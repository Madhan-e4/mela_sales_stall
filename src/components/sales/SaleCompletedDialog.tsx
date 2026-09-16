"use client";

import type { Sale } from "@/types/sale";
import { formatInr } from "@/lib/inventory";
import { summarizeCart } from "@/lib/sales";
import { ButtonLink } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type SaleCompletedDialogProps = {
  sale: Sale;
  onDone: () => void;
};

export function SaleCompletedDialog({
  sale,
  onDone,
}: SaleCompletedDialogProps) {
  const itemCount = summarizeCart(sale.items).itemCount;

  return (
    <Modal title="Sale completed" onClose={onDone} closeOnOverlay={false}>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-secondary">Sale ID</dt>
          <dd className="font-medium text-foreground">{sale.saleId}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-secondary">Items</dt>
          <dd className="font-medium text-foreground">{itemCount}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-secondary">Total</dt>
          <dd className="font-semibold tabular-nums text-foreground">
            {formatInr(sale.finalAmount)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-secondary">Payment</dt>
          <dd className="font-medium text-foreground">{sale.paymentMethod}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <ButtonLink href="/sales" variant="secondary" size="lg">
          Done
        </ButtonLink>
        <ButtonLink href={`/sales/${sale.saleId}`} size="lg">
          View Sale
        </ButtonLink>
      </div>
    </Modal>
  );
}
