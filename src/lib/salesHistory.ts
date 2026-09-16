import type { Product } from "@/types/product";
import type { PaymentMethod, Sale, SaleItem } from "@/types/sale";

export type PaymentFilter = "All" | Exclude<PaymentMethod, "Other UPI">;
export type DateFilter = "All" | "Today" | "Yesterday" | "Last 7 days";

export const PAYMENT_FILTERS: PaymentFilter[] = [
  "All",
  "Cash",
  "GPay",
  "Pending Payment",
];

export const DATE_FILTERS: DateFilter[] = [
  "All",
  "Today",
  "Yesterday",
  "Last 7 days",
];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isSameDay(isoDate: string, day: Date): boolean {
  const saleDay = startOfDay(new Date(isoDate));
  const target = startOfDay(day);
  return saleDay.getTime() === target.getTime();
}

export function formatSaleTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function getItemCount(sale: Sale): number {
  return sale.items.reduce((total, item) => total + item.quantity, 0);
}

export function getSaleItemDisplay(
  item: SaleItem,
  product?: Product,
): { type: string; subType: string } {
  return {
    type: item.productType ?? product?.type ?? "Unknown product",
    subType: item.productSubType ?? product?.subType ?? "",
  };
}

export function formatItemCount(count: number): string {
  return count === 1 ? "1 item" : `${count} items`;
}

export function formatSaleDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatSaleDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function sortSalesNewestFirst(sales: Sale[]): Sale[] {
  return [...sales].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export function matchesDateFilter(
  isoDate: string,
  filter: DateFilter,
  now = new Date(),
): boolean {
  if (filter === "All") {
    return true;
  }

  if (filter === "Today") {
    return isSameDay(isoDate, now);
  }

  if (filter === "Yesterday") {
    return isSameDay(isoDate, addDays(now, -1));
  }

  const saleTime = new Date(isoDate).getTime();
  const start = startOfDay(addDays(now, -6)).getTime();
  const end = addDays(startOfDay(now), 1).getTime();
  return saleTime >= start && saleTime < end;
}

export function saleMatchesQuery(
  sale: Sale,
  query: string,
  productsById: Map<string, Product>,
): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  if (sale.saleId.toLowerCase().includes(normalizedQuery)) {
    return true;
  }

  if (sale.paymentMethod.toLowerCase().includes(normalizedQuery)) {
    return true;
  }

  return sale.items.some((item) => {
    const product = productsById.get(item.productId);
    const display = getSaleItemDisplay(item, product);

    return (
      display.type.toLowerCase().includes(normalizedQuery) ||
      display.subType.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function filterSales(
  sales: Sale[],
  options: {
    query: string;
    paymentFilter: PaymentFilter;
    dateFilter: DateFilter;
    productsById: Map<string, Product>;
  },
): Sale[] {
  return sortSalesNewestFirst(sales).filter((sale) => {
    if (
      options.paymentFilter !== "All" &&
      sale.paymentMethod !== options.paymentFilter
    ) {
      return false;
    }

    if (!matchesDateFilter(sale.createdAt, options.dateFilter)) {
      return false;
    }

    return saleMatchesQuery(sale, options.query, options.productsById);
  });
}

export function getSalesOverview(sales: Sale[]) {
  return sales.reduce(
    (summary, sale) => {
      summary.totalSales += 1;
      summary.totalItemsSold += getItemCount(sale);
      summary.totalRevenue += sale.finalAmount;

      if (sale.paymentMethod === "Pending Payment") {
        summary.pendingPayments += sale.finalAmount;
      }

      return summary;
    },
    {
      totalSales: 0,
      totalItemsSold: 0,
      totalRevenue: 0,
      pendingPayments: 0,
    },
  );
}

export function getTodaysSales(sales: Sale[], now = new Date()): Sale[] {
  return sales.filter((sale) => isSameDay(sale.createdAt, now));
}

export function getDashboardSummary(sales: Sale[]) {
  const overview = getSalesOverview(sales);

  return {
    totalSales: overview.totalSales,
    itemsSold: overview.totalItemsSold,
    revenue: overview.totalRevenue,
    pendingPayments: overview.pendingPayments,
  };
}
