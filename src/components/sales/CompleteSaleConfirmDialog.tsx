"use client";

import type { PaymentMethod } from "@/types/sale";
import { formatInr } from "@/lib/inventory";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type CompleteSaleConfirmDialogProps = {
  itemCount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  customerPhone?: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function CompleteSaleConfirmDialog({
  itemCount,
  finalAmount,
  paymentMethod,
  customerPhone,
  isSubmitting,
  onCancel,
  onConfirm,
}: CompleteSaleConfirmDialogProps) {
  return (
    <Modal
      title="Complete Sale?"
      onClose={onCancel}
      closeOnOverlay={!isSubmitting}
    >
      <p className="mt-2 text-sm text-secondary">
        Are you sure you want to complete this sale?
      </p>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-secondary">Items</dt>
          <dd className="font-medium text-foreground">{itemCount}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-secondary">Total</dt>
          <dd className="font-semibold tabular-nums text-foreground">
            {formatInr(finalAmount)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-secondary">Payment</dt>
          <dd className="font-medium text-foreground">{paymentMethod}</dd>
        </div>
        {paymentMethod === "GPay" && customerPhone ? (
          <div className="flex justify-between gap-4">
            <dt className="text-secondary">Phone</dt>
            <dd className="font-medium text-foreground">{customerPhone}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" size="lg" disabled={isSubmitting} onClick={onCancel}>
          Cancel
        </Button>
        <Button size="lg" disabled={isSubmitting} onClick={onConfirm}>
          {isSubmitting ? "Completing..." : "Confirm Sale"}
        </Button>
      </div>
    </Modal>
  );
}
