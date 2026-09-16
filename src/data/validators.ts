import type { Product } from "@/types/product";
import type { PaymentMethod, Sale, SaleItem } from "@/types/sale";
import { KNOWN_PAYMENT_METHODS } from "@/types/sale";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    (KNOWN_PAYMENT_METHODS as readonly string[]).includes(value)
  );
}

export function isProduct(value: unknown): value is Product {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.type === "string" &&
    typeof value.subType === "string" &&
    isFiniteNumber(value.totalBought) &&
    isFiniteNumber(value.costPrice) &&
    isFiniteNumber(value.sellingPrice)
  );
}

export function isProductArray(value: unknown): value is Product[] {
  return Array.isArray(value) && value.every(isProduct);
}

function isSaleItem(value: unknown): value is SaleItem {
  return (
    isRecord(value) &&
    typeof value.productId === "string" &&
    (value.productType === undefined || typeof value.productType === "string") &&
    (value.productSubType === undefined ||
      typeof value.productSubType === "string") &&
    isFiniteNumber(value.quantity) &&
    isFiniteNumber(value.cataloguePrice) &&
    isFiniteNumber(value.actualSellingPrice) &&
    isFiniteNumber(value.lineTotal) &&
    isFiniteNumber(value.discount)
  );
}

export function isSale(value: unknown): value is Sale {
  return (
    isRecord(value) &&
    typeof value.saleId === "string" &&
    typeof value.createdAt === "string" &&
    !Number.isNaN(Date.parse(value.createdAt)) &&
    isPaymentMethod(value.paymentMethod) &&
    isFiniteNumber(value.subtotal) &&
    isFiniteNumber(value.totalDiscount) &&
    isFiniteNumber(value.finalAmount) &&
    (value.customerPhone === undefined || typeof value.customerPhone === "string") &&
    Array.isArray(value.items) &&
    value.items.every(isSaleItem)
  );
}

export function isSaleArray(value: unknown): value is Sale[] {
  return Array.isArray(value) && value.every(isSale);
}
