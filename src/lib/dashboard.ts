import type { ProductWithStock } from "@/types/product";
import type { Sale } from "@/types/sale";
import { sortSalesNewestFirst } from "./salesHistory";

export const PAYMENT_ROWS = [
  { key: "Cash", label: "Cash" },
  { key: "GPay", label: "GPay" },
  { key: "Pending Payment", label: "Pending" },
] as const;

type PaymentRowKey = (typeof PAYMENT_ROWS)[number]["key"];

export function getRecentSales(sales: Sale[], limit = 5): Sale[] {
  return sortSalesNewestFirst(sales).slice(0, limit);
}

export function getPaymentSummary(sales: Sale[]) {
  const summary: Record<PaymentRowKey, number> = {
    Cash: 0,
    GPay: 0,
    "Pending Payment": 0,
  };

  for (const sale of sales) {
    if (sale.paymentMethod in summary) {
      summary[sale.paymentMethod as PaymentRowKey] += sale.finalAmount;
    }
  }

  return summary;
}

export function getLowStockProducts(products: ProductWithStock[]) {
  return products.filter(
    (product) => product.remaining >= 1 && product.remaining <= 3,
  );
}

export function getOutOfStockProducts(products: ProductWithStock[]) {
  return products.filter((product) => product.remaining === 0);
}

export function getInventoryOverview(products: ProductWithStock[]) {
  return products.reduce(
    (summary, product) => {
      summary.totalProducts += 1;
      summary.totalUnitsInStock += product.remaining;
      summary.totalUnitsSold += product.sold;
      return summary;
    },
    {
      totalProducts: 0,
      totalUnitsInStock: 0,
      totalUnitsSold: 0,
    },
  );
}
