import type { Product, ProductWithStock } from "@/types/product";
import type { Sale } from "@/types/sale";
import { getSaleItemDisplay } from "@/lib/salesHistory";

export type CsvExportResult =
  | { ok: true }
  | { ok: false; message: string };

const INVENTORY_HEADERS = [
  "Product ID",
  "Type",
  "Sub-Type",
  "Total Bought",
  "CP",
  "Sold So Far",
  "Price",
  "Remaining Stock",
] as const;

const SALES_HEADERS = [
  "Transaction ID",
  "Sale ID",
  "Type",
  "Sub-Type",
  "Qty",
  "Bought on",
  "Unit Price",
  "Bought for",
  "Mode of Pay",
  "Customer Phone",
] as const;

export function formatExportDateTime(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function escapeCsvValue(
  value: string | number,
  options?: { asText?: boolean },
): string {
  const raw = String(value);

  if (options?.asText && raw === "") {
    return "";
  }

  const needsQuotes = Boolean(options?.asText) || /[",\r\n]/.test(raw);

  if (!needsQuotes) {
    return raw;
  }

  return `"${raw.replace(/"/g, '""')}"`;
}

export function toCsv(
  rows: Array<Array<string | number>>,
  textColumns: Set<number> = new Set(),
): string {
  return rows
    .map((row, rowIndex) =>
      row
        .map((value, index) =>
          escapeCsvValue(value, {
            asText: rowIndex > 0 && textColumns.has(index),
          }),
        )
        .join(","),
    )
    .join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const content = new TextEncoder().encode(`${csv}\r\n`);
  const bytes = new Uint8Array(bom.length + content.length);
  bytes.set(bom);
  bytes.set(content, bom.length);

  const blob = new Blob([bytes], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function buildInventoryCsvRows(products: ProductWithStock[]): Array<Array<string | number>> {
  return products.map((product) => [
    product.id,
    product.type,
    product.subType,
    product.totalBought,
    product.costPrice,
    product.sold,
    product.sellingPrice,
    product.remaining,
  ]);
}

export function buildSalesCsvRows(
  sales: Sale[],
  productsById: Map<string, Product>,
): Array<Array<string | number>> {
  const orderedSales = [...sales].sort((left, right) => {
    const byDate = left.createdAt.localeCompare(right.createdAt);

    if (byDate !== 0) {
      return byDate;
    }

    return left.saleId.localeCompare(right.saleId);
  });

  return orderedSales.flatMap((sale) =>
    sale.items.map((item, index) => {
      const display = getSaleItemDisplay(item, productsById.get(item.productId));

      return [
        `${sale.saleId}-${index + 1}`,
        sale.saleId,
        display.type,
        display.subType,
        item.quantity,
        formatExportDateTime(sale.createdAt),
        item.actualSellingPrice,
        item.lineTotal,
        sale.paymentMethod,
        sale.customerPhone ?? "",
      ];
    }),
  );
}

export function exportInventoryCsv(products: ProductWithStock[]): CsvExportResult {
  if (products.length === 0) {
    return { ok: false, message: "Nothing to export." };
  }

  const csv = toCsv([[...INVENTORY_HEADERS], ...buildInventoryCsvRows(products)], new Set([0]));
  downloadCsv("stall-sales-inventory.csv", csv);
  return { ok: true };
}

export function exportSalesCsv(
  sales: Sale[],
  productsById: Map<string, Product>,
): CsvExportResult {
  const rows = buildSalesCsvRows(sales, productsById);

  if (rows.length === 0) {
    return { ok: false, message: "No sales to export." };
  }

  const csv = toCsv([[...SALES_HEADERS], ...rows], new Set([0, 1, 9]));
  downloadCsv("stall-sales-transactions.csv", csv);
  return { ok: true };
}
