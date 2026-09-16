import type { NewSale, PaymentMethod, Sale, SaleItem } from "@/types/sale";
import { nextSaleId } from "@/lib/sales";
import { getProducts } from "./productStore";
import { INITIAL_SALES } from "./sales";
import { readStoredJson, storageKeys, writeJson } from "./storage";
import { isSaleArray } from "./validators";

let sales: Sale[] = INITIAL_SALES;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function persist() {
  writeJson(storageKeys.sales, sales);
}

function withProductSnapshots(items: SaleItem[]): SaleItem[] {
  const productsById = new Map(
    getProducts().map((product) => [product.id, product]),
  );

  return items.map((item) => {
    if (item.productType !== undefined && item.productSubType !== undefined) {
      return item;
    }

    const product = productsById.get(item.productId);

    return {
      ...item,
      productType: item.productType ?? product?.type ?? "Unknown product",
      productSubType: item.productSubType ?? product?.subType ?? "",
    };
  });
}

function backfillSnapshots() {
  let changed = false;

  const nextSales = sales.map((sale) => {
    const items = withProductSnapshots(sale.items);
    const itemsChanged = items.some((item, index) => item !== sale.items[index]);

    if (!itemsChanged) {
      return sale;
    }

    changed = true;
    return { ...sale, items };
  });

  if (changed) {
    sales = nextSales;
    persist();
  }
}

export function getSales(): Sale[] {
  hydrateSales();
  return sales;
}

export function getServerSales(): Sale[] {
  return INITIAL_SALES;
}

export function getSaleById(saleId: string): Sale | undefined {
  return getSales().find((sale) => sale.saleId === saleId);
}

export function hydrateSales(): void {
  if (hydrated || typeof window === "undefined") {
    return;
  }

  hydrated = true;
  const stored = readStoredJson(
    storageKeys.sales,
    storageKeys.legacySales,
    isSaleArray,
  );

  if (stored) {
    sales = stored;
    backfillSnapshots();
    return;
  }

  persist();
}

export function addSale(input: NewSale): Sale {
  hydrateSales();
  const sale: Sale = {
    ...input,
    items: withProductSnapshots(input.items),
    saleId: nextSaleId(sales),
    createdAt: new Date().toISOString(),
  };

  sales = [sale, ...sales];
  persist();
  emit();
  return sale;
}

export function updateSale(
  saleId: string,
  updates: {
    paymentMethod?: PaymentMethod;
    customerPhone?: string | null;
    items?: SaleItem[];
    subtotal?: number;
    totalDiscount?: number;
    finalAmount?: number;
  },
): void {
  hydrateSales();
  sales = sales.map((sale) => {
    if (sale.saleId !== saleId) {
      return sale;
    }

    const items = updates.items
      ? withProductSnapshots(updates.items)
      : sale.items;
    const { customerPhone, items: _items, ...restUpdates } = updates;

    const nextSale: Sale = {
      ...sale,
      ...restUpdates,
      items,
      saleId: sale.saleId,
      createdAt: sale.createdAt,
    };

    if (nextSale.paymentMethod !== "GPay") {
      delete nextSale.customerPhone;
    } else if (customerPhone === null) {
      delete nextSale.customerPhone;
    } else if (typeof customerPhone === "string") {
      nextSale.customerPhone = customerPhone;
    }

    return nextSale;
  });
  persist();
  emit();
}

export function subscribeSales(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
