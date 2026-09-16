import type { Sale, SaleItem } from "@/types/sale";

function saleItem(
  productId: string,
  productType: string,
  productSubType: string,
  quantity: number,
  cataloguePrice: number,
  actualSellingPrice: number,
): SaleItem {
  return {
    productId,
    productType,
    productSubType,
    quantity,
    cataloguePrice,
    actualSellingPrice,
    lineTotal: quantity * actualSellingPrice,
    discount: quantity * (cataloguePrice - actualSellingPrice),
  };
}

function sale(
  saleId: string,
  createdAt: string,
  paymentMethod: Sale["paymentMethod"],
  items: SaleItem[],
): Sale {
  return {
    saleId,
    createdAt,
    items,
    paymentMethod,
    subtotal: items.reduce(
      (total, item) => total + item.quantity * item.cataloguePrice,
      0,
    ),
    totalDiscount: items.reduce((total, item) => total + item.discount, 0),
    finalAmount: items.reduce((total, item) => total + item.lineTotal, 0),
  };
}

export const INITIAL_SALES: Sale[] = [
  sale("S008", "2026-09-14T04:30:00.000Z", "GPay", [
    saleItem(
      "product-saree-13",
      "Saree 13",
      "Super Soft",
      1,
      1600,
      1400,
    ),
  ]),
  sale("S007", "2026-09-11T07:30:00.000Z", "GPay", [
    saleItem("product-saree-12", "Saree 12", "Soft Silk", 1, 1600, 1600),
    saleItem("product-saree-11", "Saree 11", "Small fold", 2, 890, 890),
  ]),
  sale("S006", "2026-09-11T06:30:00.000Z", "GPay", [
    saleItem("product-saree-12", "Saree 12", "Soft Silk", 1, 1600, 1600),
  ]),
  sale("S005", "2026-09-11T05:30:00.000Z", "Pending Payment", [
    saleItem("product-saree-14", "Saree 14", "Fancy", 1, 800, 800),
  ]),
  sale("S004", "2026-09-11T04:30:00.000Z", "GPay", [
    saleItem("product-saree-8", "Saree 8", "Close Border", 1, 1200, 1200),
    saleItem("product-blouse", "Blouse", "", 3, 170, 170),
  ]),
  sale("S003", "2026-09-10T05:30:00.000Z", "Cash", [
    saleItem("product-saree-1", "Saree 1", "Grand", 1, 3000, 3000),
  ]),
  sale("S002", "2026-09-10T05:00:00.000Z", "GPay", [
    saleItem("product-saree-12", "Saree 12", "Soft Silk", 1, 1600, 1600),
  ]),
  sale("S001", "2026-09-10T04:30:00.000Z", "GPay", [
    saleItem("product-saree-12", "Saree 12", "Soft Silk", 1, 1600, 1600),
  ]),
];
