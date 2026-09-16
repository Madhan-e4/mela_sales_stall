import type { Product, ProductWithStock, StockStatus } from "@/types/product";
import type { Sale } from "@/types/sale";

export function getRemaining(totalBought: number, sold: number): number {
  return totalBought - sold;
}

export function getStockStatus(remaining: number): StockStatus {
  if (remaining <= 0) {
    return "Out of Stock";
  }

  if (remaining <= 3) {
    return "Low Stock";
  }

  return "In Stock";
}

export function getSoldByProductId(sales: Sale[]): Map<string, number> {
  const soldByProductId = new Map<string, number>();

  for (const sale of sales) {
    for (const item of sale.items) {
      soldByProductId.set(
        item.productId,
        (soldByProductId.get(item.productId) ?? 0) + item.quantity,
      );
    }
  }

  return soldByProductId;
}

export function attachStock(product: Product, sold: number): ProductWithStock {
  const remaining = getRemaining(product.totalBought, sold);

  return {
    ...product,
    sold,
    remaining,
    stockStatus: getStockStatus(remaining),
  };
}

export function getAvailableStock(remaining: number): number {
  return Math.max(0, remaining);
}

export function productHasSales(sales: Sale[], productId: string): boolean {
  return sales.some((sale) =>
    sale.items.some((item) => item.productId === productId),
  );
}

export function getTotalBoughtError(
  totalBought: number,
  sold: number,
): string | null {
  if (totalBought < sold) {
    return `Total Bought cannot be less than ${sold} already sold.`;
  }

  return null;
}

export function filterProducts<T extends Product>(
  products: T[],
  query: string,
  options?: { matchPrice?: boolean },
): T[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) => {
    if (
      product.type.toLowerCase().includes(normalizedQuery) ||
      product.subType.toLowerCase().includes(normalizedQuery)
    ) {
      return true;
    }

    return Boolean(options?.matchPrice) && matchesSellingPrice(product.sellingPrice, normalizedQuery);
  });
}

function compactPriceSearchText(value: string): string {
  return value.replace(/[₹,\s]/g, "");
}

function matchesSellingPrice(sellingPrice: number, normalizedQuery: string): boolean {
  const compactQuery = compactPriceSearchText(normalizedQuery);

  if (compactQuery === "") {
    return false;
  }

  const parsedPrice = Number(compactQuery);

  if (!Number.isFinite(parsedPrice)) {
    return false;
  }

  return sellingPrice === parsedPrice;
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function displaySubType(subType: string): string {
  return subType.trim() === "" ? "—" : subType;
}
