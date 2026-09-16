"use client";

import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { updateSale } from "@/data/store";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import type { CollectedPaymentMethod } from "@/types/sale";
import { ButtonLink } from "@/components/ui/Button";
import { MarkAsPaidDialog } from "./MarkAsPaidDialog";
import { SaleDetailsPanel } from "./SaleDetailsPanel";

type SaleDetailsViewProps = {
  saleId: string;
};

export function SaleDetailsView({ saleId }: SaleDetailsViewProps) {
  const sales = useSales();
  const products = useProducts();
  const [isSettling, setIsSettling] = useState(false);
  const sale = sales.find((item) => item.saleId === saleId);
  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  function handleMarkAsPaid(method: CollectedPaymentMethod) {
    updateSale(saleId, { paymentMethod: method });
    setIsSettling(false);
  }

  if (!sale) {
    return (
      <div className="space-y-3">
        <ButtonLink
          href="/sales"
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 px-2 text-secondary"
        >
          <ChevronLeft size={16} strokeWidth={1.75} />
          Back
        </ButtonLink>
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
          Sale not found
        </h1>
        <p className="text-sm text-secondary">This sale is not available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ButtonLink
        href="/sales"
        variant="ghost"
        size="sm"
        className="-ml-2 h-8 px-2 text-secondary"
      >
        <ChevronLeft size={16} strokeWidth={1.75} />
        Back
      </ButtonLink>
      <SaleDetailsPanel
        sale={sale}
        productsById={productsById}
        onMarkAsPaid={
          sale.paymentMethod === "Pending Payment"
            ? () => setIsSettling(true)
            : undefined
        }
      />
      {isSettling ? (
        <MarkAsPaidDialog
          saleId={sale.saleId}
          onCancel={() => setIsSettling(false)}
          onConfirm={handleMarkAsPaid}
        />
      ) : null}
    </div>
  );
}
