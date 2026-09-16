import type { CartItem, NewSale, PaymentMethod, Sale, SaleItem } from "@/types/sale";
import { PAYMENT_METHODS } from "@/types/sale";
import type { Product, ProductWithStock } from "@/types/product";
import { getAvailableStock } from "./inventory";
import { validateNonNegativeNumber, validateQuantity } from "./validation";

export function getLineTotal(item: Pick<CartItem, "quantity" | "actualSellingPrice">): number {
  return item.quantity * item.actualSellingPrice;
}

export function getLineDiscount(item: CartItem): number {
  return item.quantity * (item.cataloguePrice - item.actualSellingPrice);
}

export function summarizeCart(items: CartItem[]) {
  return items.reduce(
    (summary, item) => {
      summary.subtotal += item.quantity * item.cataloguePrice;
      summary.totalDiscount += getLineDiscount(item);
      summary.finalAmount += getLineTotal(item);
      summary.itemCount += item.quantity;
      return summary;
    },
    { subtotal: 0, totalDiscount: 0, finalAmount: 0, itemCount: 0 },
  );
}

export function toSaleItems(
  items: CartItem[],
  productsById: Map<string, Pick<Product, "type" | "subType">>,
): SaleItem[] {
  return items.map((item) => {
    const product = productsById.get(item.productId);

    return {
      productId: item.productId,
      productType: item.productType ?? product?.type ?? "Unknown product",
      productSubType: item.productSubType ?? product?.subType ?? "",
      quantity: item.quantity,
      cataloguePrice: item.cataloguePrice,
      actualSellingPrice: item.actualSellingPrice,
      lineTotal: getLineTotal(item),
      discount: getLineDiscount(item),
    };
  });
}

export function saleToCartItems(sale: Sale): CartItem[] {
  return sale.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    cataloguePrice: item.cataloguePrice,
    actualSellingPrice: item.actualSellingPrice,
    productType: item.productType,
    productSubType: item.productSubType,
  }));
}

export function getOriginalSaleQuantity(sale: Sale, productId: string): number {
  return sale.items
    .filter((item) => item.productId === productId)
    .reduce((total, item) => total + item.quantity, 0);
}

export function getEditStockLimit(
  remaining: number,
  originalQuantity: number,
): number {
  return getAvailableStock(remaining) + originalQuantity;
}

export function getEditableStock(
  product: ProductWithStock,
  cartItems: CartItem[],
  originalSale: Sale,
  options?: { ignoreCartProductId?: string },
): number {
  const originalQuantity = getOriginalSaleQuantity(originalSale, product.id);
  const cartQuantity = cartItems.reduce((total, item) => {
    if (item.productId !== product.id) {
      return total;
    }

    if (options?.ignoreCartProductId && item.productId === options.ignoreCartProductId) {
      return total;
    }

    return total + item.quantity;
  }, 0);

  return getEditStockLimit(product.remaining, originalQuantity) - cartQuantity;
}

export function nextSaleId(sales: Sale[]): string {
  let max = 0;

  for (const sale of sales) {
    const numericId = Number.parseInt(sale.saleId.replace(/^S/i, ""), 10);

    if (Number.isFinite(numericId) && numericId > max) {
      max = numericId;
    }
  }

  return `S${String(max + 1).padStart(3, "0")}`;
}

export function getCartQuantity(items: CartItem[], productId: string): number {
  return items.find((item) => item.productId === productId)?.quantity ?? 0;
}

export function getSelectableStock(
  product: ProductWithStock,
  cartItems: CartItem[],
): number {
  return getAvailableStock(product.remaining) - getCartQuantity(cartItems, product.id);
}

export function validateCart(
  items: CartItem[],
  products: ProductWithStock[],
  paymentMethod: string | null,
): string | null {
  if (items.length === 0) {
    return "Add at least one product.";
  }

  if (!paymentMethod || !(PAYMENT_METHODS as readonly string[]).includes(paymentMethod)) {
    return "Select a payment method.";
  }

  const productsById = new Map(products.map((product) => [product.id, product]));

  for (const item of items) {
    const product = productsById.get(item.productId);

    if (!product) {
      return "A selected product is no longer in the catalogue.";
    }

    const quantity = validateQuantity(
      item.quantity,
      getAvailableStock(product.remaining),
    );

    if (!quantity.ok) {
      return quantity.error;
    }

    const price = validateNonNegativeNumber(item.actualSellingPrice, {
      field: "Price",
    });

    if (!price.ok) {
      return price.error;
    }
  }

  return null;
}

export function validateEditedSale(
  items: CartItem[],
  products: ProductWithStock[],
  paymentMethod: string | null,
  originalSale: Sale,
): string | null {
  if (items.length === 0) {
    return "A sale must contain at least one item.";
  }

  if (!paymentMethod) {
    return "Select a payment method.";
  }

  const productsById = new Map(products.map((product) => [product.id, product]));

  for (const item of items) {
    const product = productsById.get(item.productId);
    const originalQuantity = getOriginalSaleQuantity(originalSale, item.productId);

    if (!product) {
      if (originalQuantity === 0) {
        return "A selected product is no longer in the catalogue.";
      }

      const quantity = validateQuantity(item.quantity, originalQuantity);

      if (!quantity.ok) {
        return quantity.error;
      }
    } else {
      const quantity = validateQuantity(
        item.quantity,
        getEditStockLimit(product.remaining, originalQuantity),
      );

      if (!quantity.ok) {
        return quantity.error;
      }
    }

    const price = validateNonNegativeNumber(item.actualSellingPrice, {
      field: "Price",
    });

    if (!price.ok) {
      return price.error;
    }
  }

  return null;
}

export function isSaleDraftChanged(
  original: Sale,
  items: CartItem[],
  paymentMethod: PaymentMethod,
  customerPhone = "",
): boolean {
  if (original.paymentMethod !== paymentMethod) {
    return true;
  }

  const originalPhone = original.customerPhone ?? "";
  const nextPhone = paymentMethod === "GPay" ? customerPhone.trim() : "";

  if (originalPhone !== nextPhone) {
    return true;
  }

  if (original.items.length !== items.length) {
    return true;
  }

  const originalByProductId = new Map(
    original.items.map((item) => [item.productId, item]),
  );

  return items.some((draft) => {
    const item = originalByProductId.get(draft.productId);

    return (
      !item ||
      item.quantity !== draft.quantity ||
      item.actualSellingPrice !== draft.actualSellingPrice ||
      item.cataloguePrice !== draft.cataloguePrice
    );
  });
}

export function buildUpdatedSale(
  original: Sale,
  items: CartItem[],
  paymentMethod: Sale["paymentMethod"],
  productsById: Map<string, Pick<Product, "type" | "subType">>,
  customerPhone?: string,
): Sale {
  const summary = summarizeCart(items);

  return {
    saleId: original.saleId,
    createdAt: original.createdAt,
    items: toSaleItems(items, productsById),
    paymentMethod,
    subtotal: summary.subtotal,
    totalDiscount: summary.totalDiscount,
    finalAmount: summary.finalAmount,
    ...(paymentMethod === "GPay" && customerPhone
      ? { customerPhone }
      : {}),
  };
}

export function buildNewSale(
  items: CartItem[],
  paymentMethod: NewSale["paymentMethod"],
  productsById: Map<string, Pick<Product, "type" | "subType">>,
  customerPhone?: string,
): NewSale {
  const summary = summarizeCart(items);

  return {
    items: toSaleItems(items, productsById),
    paymentMethod,
    subtotal: summary.subtotal,
    totalDiscount: summary.totalDiscount,
    finalAmount: summary.finalAmount,
    ...(paymentMethod === "GPay" && customerPhone
      ? { customerPhone }
      : {}),
  };
}
