"use client";

import type { Product } from "@/types/product";
import type { Sale } from "@/types/sale";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SaleDetailsPanel } from "./SaleDetailsPanel";

type SaleDetailsModalProps = {
  sale: Sale;
  productsById: Map<string, Product>;
  onClose: () => void;
  onMarkAsPaid?: () => void;
};

export function SaleDetailsModal({
  sale,
  productsById,
  onClose,
  onMarkAsPaid,
}: SaleDetailsModalProps) {
  return (
    <Modal
      title={`Sale ${sale.saleId}`}
      titleHidden
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      <SaleDetailsPanel
        sale={sale}
        productsById={productsById}
        onMarkAsPaid={onMarkAsPaid}
      />
      <div className="mt-6 flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
