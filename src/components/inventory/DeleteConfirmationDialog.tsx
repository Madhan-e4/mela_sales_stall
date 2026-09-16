"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type DeleteConfirmationDialogProps = {
  productName: string;
  hasSalesHistory?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmationDialog({
  productName,
  hasSalesHistory = false,
  onCancel,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  return (
    <Modal
      title={
        hasSalesHistory
          ? "This product has sales history."
          : "Delete this product?"
      }
      onClose={onCancel}
    >
      <p className="mt-2 text-sm text-secondary">
        {hasSalesHistory
          ? `Deleting the catalogue item will not remove past sales for ${productName}.`
          : `Are you sure you want to remove ${productName} from your catalogue?`}
      </p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {hasSalesHistory ? "Delete Catalogue Item" : "Delete"}
        </Button>
      </div>
    </Modal>
  );
}
