"use client";

import { useState } from "react";
import type { CollectedPaymentMethod } from "@/types/sale";
import { COLLECTED_PAYMENT_METHODS } from "@/types/sale";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type MarkAsPaidDialogProps = {
  saleId: string;
  onCancel: () => void;
  onConfirm: (method: CollectedPaymentMethod) => void;
};

export function MarkAsPaidDialog({
  saleId,
  onCancel,
  onConfirm,
}: MarkAsPaidDialogProps) {
  const [method, setMethod] = useState<CollectedPaymentMethod>("GPay");

  return (
    <Modal
      title={`Mark ${saleId} as paid`}
      onClose={onCancel}
      zIndexClassName="z-[60]"
    >
      <p className="mt-2 text-sm text-secondary">
        How was this payment collected?
      </p>

      <fieldset className="mt-4">
        <legend className="sr-only">Collected payment method</legend>
        <div className="grid grid-cols-1 gap-2">
          {COLLECTED_PAYMENT_METHODS.map((option) => {
            const selected = option === method;

            return (
              <label
                key={option}
                className={cn(
                  "flex h-12 cursor-pointer items-center justify-center rounded-[10px] border px-3 text-sm font-medium transition-colors duration-150",
                  selected
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-surface text-secondary hover:bg-background",
                )}
              >
                <input
                  type="radio"
                  name="collectedPaymentMethod"
                  value={option}
                  checked={selected}
                  onChange={() => setMethod(option)}
                  className="sr-only"
                />
                {option}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" size="lg" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="lg" onClick={() => onConfirm(method)}>
          Mark as Paid
        </Button>
      </div>
    </Modal>
  );
}
