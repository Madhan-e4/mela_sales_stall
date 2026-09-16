"use client";

import { useMemo, useState } from "react";
import { updateSale } from "@/data/store";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { formatInr } from "@/lib/inventory";
import { exportSalesCsv } from "@/lib/csvExport";
import {
  DATE_FILTERS,
  PAYMENT_FILTERS,
  filterSales,
  getSalesOverview,
  type DateFilter,
  type PaymentFilter,
} from "@/lib/salesHistory";
import type { CollectedPaymentMethod, Sale } from "@/types/sale";
import { CsvExportButton } from "@/components/CsvExportButton";
import { SummaryCard } from "@/components/SummaryCard";
import { ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { MarkAsPaidDialog } from "./MarkAsPaidDialog";
import { SaleDetailsModal } from "./SaleDetailsModal";
import { SalesTable } from "./SalesTable";

export function SalesView() {
  const sales = useSales();
  const products = useProducts();
  const [query, setQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("All");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleToSettle, setSaleToSettle] = useState<Sale | null>(null);

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const overview = useMemo(() => getSalesOverview(sales), [sales]);

  const visibleSales = useMemo(
    () =>
      filterSales(sales, {
        query,
        paymentFilter,
        dateFilter,
        productsById,
      }),
    [sales, query, paymentFilter, dateFilter, productsById],
  );

  const selectedSaleLive = selectedSale
    ? (sales.find((sale) => sale.saleId === selectedSale.saleId) ?? null)
    : null;

  function handleMarkAsPaid(method: CollectedPaymentMethod) {
    if (!saleToSettle) {
      return;
    }

    updateSale(saleToSettle.saleId, { paymentMethod: method });
    setSaleToSettle(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sales"
        description="Completed transactions, payments, and sale details."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-start">
            <CsvExportButton
              onExport={() => exportSalesCsv(sales, productsById)}
            />
            <ButtonLink
              href="/sales/new"
              size="lg"
              className="w-full sm:h-10 sm:w-auto sm:text-sm"
            >
              + New Sale
            </ButtonLink>
          </div>
        }
      />

      <section
        aria-label="Sales summary"
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        <SummaryCard label="Total Sales" value={String(overview.totalSales)} />
        <SummaryCard
          label="Total Items Sold"
          value={String(overview.totalItemsSold)}
        />
        <SummaryCard
          label="Total Revenue"
          value={formatInr(overview.totalRevenue)}
        />
        <SummaryCard
          label="Pending Payments"
          value={formatInr(overview.pendingPayments)}
          tone="warning"
        />
      </section>

      <label className="block">
        <span className="sr-only">Search sales</span>
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sales"
        />
      </label>

      <div className="space-y-3">
        <FilterGroup
          label="Payment"
          options={PAYMENT_FILTERS}
          value={paymentFilter}
          onChange={setPaymentFilter}
        />
        <FilterGroup
          label="Date"
          options={DATE_FILTERS}
          value={dateFilter}
          onChange={setDateFilter}
        />
      </div>

      {visibleSales.length === 0 ? (
        <EmptyState
          title={sales.length === 0 ? "No sales yet" : "No matching sales"}
          description={
            sales.length === 0
              ? "Your completed sales will appear here."
              : "Try a different search or filter."
          }
          action={
            sales.length === 0 ? (
              <ButtonLink href="/sales/new">+ New Sale</ButtonLink>
            ) : undefined
          }
        />
      ) : (
        <SalesTable sales={visibleSales} onView={setSelectedSale} />
      )}

      {selectedSaleLive ? (
        <SaleDetailsModal
          sale={selectedSaleLive}
          productsById={productsById}
          onClose={() => setSelectedSale(null)}
          onMarkAsPaid={
            selectedSaleLive.paymentMethod === "Pending Payment"
              ? () => setSaleToSettle(selectedSaleLive)
              : undefined
          }
        />
      ) : null}

      {saleToSettle ? (
        <MarkAsPaidDialog
          saleId={saleToSettle.saleId}
          onCancel={() => setSaleToSettle(null)}
          onConfirm={handleMarkAsPaid}
        />
      ) : null}
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
        {label}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip
            key={option}
            selected={option === value}
            onClick={() => onChange(option)}
          >
            {option}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}
