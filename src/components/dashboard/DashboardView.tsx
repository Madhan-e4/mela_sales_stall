"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  Banknote,
  Clock3,
  Package,
  ShoppingBag,
} from "lucide-react";
import { SummaryCard } from "@/components/SummaryCard";
import { PaymentBadge } from "@/components/sales/PaymentBadge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, THead, TH, TR, TD } from "@/components/ui/Table";
import { useProductStock } from "@/hooks/useProductStock";
import { useSales } from "@/hooks/useSales";
import {
  getInventoryOverview,
  getLowStockProducts,
  getOutOfStockProducts,
  getPaymentSummary,
  getRecentSales,
  PAYMENT_ROWS,
} from "@/lib/dashboard";
import { displaySubType, formatInr } from "@/lib/inventory";
import {
  formatItemCount,
  formatSaleDate,
  getDashboardSummary,
  getItemCount,
} from "@/lib/salesHistory";
import type { Sale } from "@/types/sale";

export function DashboardView() {
  const sales = useSales();
  const products = useProductStock();
  const summary = useMemo(() => getDashboardSummary(sales), [sales]);
  const recentSales = useMemo(() => getRecentSales(sales, 5), [sales]);
  const payments = useMemo(() => getPaymentSummary(sales), [sales]);
  const lowStock = useMemo(() => getLowStockProducts(products), [products]);
  const outOfStock = useMemo(() => getOutOfStockProducts(products), [products]);
  const inventory = useMemo(() => getInventoryOverview(products), [products]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overall sales, payments, and inventory."
      />

      <section
        aria-label="Summary"
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        <SummaryCard
          label="Total Sales"
          value={String(summary.totalSales)}
          hint="completed sales"
          icon={<ShoppingBag size={16} strokeWidth={1.75} />}
        />
        <SummaryCard
          label="Items Sold"
          value={String(summary.itemsSold)}
          hint="units"
          icon={<Package size={16} strokeWidth={1.75} />}
        />
        <SummaryCard
          label="Revenue"
          value={formatInr(summary.revenue)}
          hint="collected and pending"
          icon={<Banknote size={16} strokeWidth={1.75} />}
        />
        <SummaryCard
          label="Pending Payments"
          value={formatInr(summary.pendingPayments)}
          hint="awaiting collection"
          tone="warning"
          icon={<Clock3 size={16} strokeWidth={1.75} />}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-[13px] font-medium text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <ButtonLink href="/sales/new" size="lg" className="col-span-2 sm:col-span-1">
            + New Sale
          </ButtonLink>
          <ButtonLink href="/inventory" variant="secondary" size="lg">
            Inventory
          </ButtonLink>
          <ButtonLink href="/sales" variant="secondary" size="lg">
            Sales History
          </ButtonLink>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentSalesSection sales={recentSales} />
        <LowStockSection products={lowStock} />
      </div>

      {outOfStock.length > 0 ? (
        <OutOfStockSection products={outOfStock} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-[13px] font-medium text-foreground">
            Payments
          </h2>
          <Card className="px-4 py-2">
            <dl className="text-sm">
              {PAYMENT_ROWS.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <dt
                    className={
                      row.key === "Pending Payment"
                        ? "text-warning"
                        : "text-secondary"
                    }
                  >
                    {row.label}
                  </dt>
                  <dd
                    className={`tabular-nums ${
                      row.key === "Pending Payment"
                        ? "font-medium text-warning"
                        : "text-foreground"
                    }`}
                  >
                    {formatInr(payments[row.key])}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-medium text-foreground">
            Inventory overview
          </h2>
          <Card className="px-4 py-2">
            <dl className="text-sm">
              <OverviewRow
                label="Total Products"
                value={String(inventory.totalProducts)}
              />
              <OverviewRow
                label="Total Units in Stock"
                value={String(inventory.totalUnitsInStock)}
              />
              <OverviewRow
                label="Total Units Sold"
                value={String(inventory.totalUnitsSold)}
              />
            </dl>
          </Card>
        </section>
      </div>
    </div>
  );
}

function RecentSalesSection({ sales }: { sales: Sale[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-medium text-foreground">Recent Sales</h2>
        <ButtonLink href="/sales" variant="ghost" size="sm" className="h-8 px-2">
          View all
        </ButtonLink>
      </div>
      {sales.length === 0 ? (
        <EmptyState
          title="No sales yet"
          description="Your completed sales will appear here."
        />
      ) : (
        <Table minWidthClassName="min-w-[28rem]">
          <THead>
            <tr>
              <TH>Sale ID</TH>
              <TH align="right">Items</TH>
              <TH align="right">Amount</TH>
              <TH>Payment</TH>
              <TH align="right">Date</TH>
            </tr>
          </THead>
          <tbody>
            {sales.map((sale) => {
              const pending = sale.paymentMethod === "Pending Payment";

              return (
                <TR key={sale.saleId} highlight={pending}>
                  <TD className="font-medium text-foreground">{sale.saleId}</TD>
                  <TD align="right" numeric>
                    {formatItemCount(getItemCount(sale))}
                  </TD>
                  <TD align="right" numeric className="font-medium">
                    {formatInr(sale.finalAmount)}
                  </TD>
                  <TD>
                    <PaymentBadge method={sale.paymentMethod} />
                  </TD>
                  <TD align="right" className="text-secondary">
                    {formatSaleDate(sale.createdAt)}
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      )}
    </section>
  );
}

function LowStockSection({
  products,
}: {
  products: ReturnType<typeof getLowStockProducts>;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-medium text-foreground">Low Stock</h2>
        <ButtonLink
          href="/inventory"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
        >
          View inventory
        </ButtonLink>
      </div>
      {products.length === 0 ? (
        <EmptyState
          title="Stock looks healthy"
          description="All products currently have sufficient remaining units."
        />
      ) : (
        <StockList
          items={products.map((product) => ({
            id: product.id,
            type: product.type,
            subType: product.subType,
            detail: `${product.remaining} left`,
          }))}
        />
      )}
    </section>
  );
}

function OutOfStockSection({
  products,
}: {
  products: ReturnType<typeof getOutOfStockProducts>;
}) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-[13px] font-medium text-foreground">
        <AlertTriangle size={14} strokeWidth={1.75} className="text-danger" />
        Out of Stock
      </h2>
      <StockList
        items={products.map((product) => ({
          id: product.id,
          type: product.type,
          subType: product.subType,
        }))}
      />
    </section>
  );
}

function StockList({
  items,
}: {
  items: {
    id: string;
    type: string;
    subType: string;
    detail?: string;
  }[];
}) {
  return (
    <Card className="divide-y divide-border overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start justify-between gap-3 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{item.type}</p>
            <p className="text-[13px] text-secondary">
              {displaySubType(item.subType)}
            </p>
          </div>
          {item.detail ? (
            <p className="shrink-0 text-sm font-medium tabular-nums text-warning">
              {item.detail}
            </p>
          ) : null}
        </div>
      ))}
    </Card>
  );
}

function OverviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-secondary">{label}</dt>
      <dd className="tabular-nums text-foreground">{value}</dd>
    </div>
  );
}
