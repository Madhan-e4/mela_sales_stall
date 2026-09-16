import type { NewProduct } from "@/types/product";
import { getTotalBoughtError } from "@/lib/inventory";

export type ValidationResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

export type CartItemFieldErrors = {
  quantity?: string;
  price?: string;
};

export type ProductFormValues = {
  type: string;
  subType: string;
  totalBought: string;
  costPrice: string;
  sellingPrice: string;
};

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

type NumericInspection =
  | { kind: "empty" }
  | { kind: "invalid" }
  | { kind: "number"; value: number; negative: boolean; hasDecimal: boolean };

function toRaw(value: string | number): string {
  return typeof value === "number" ? String(value) : value;
}

function inspectNumericInput(raw: string | number): NumericInspection {
  const trimmed = toRaw(raw).trim();

  if (trimmed === "") {
    return { kind: "empty" };
  }

  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;

  if (!/^\d+(\.\d+)?$/.test(unsigned)) {
    return { kind: "invalid" };
  }

  const value = Number(trimmed);

  if (!Number.isFinite(value)) {
    return { kind: "invalid" };
  }

  return {
    kind: "number",
    value,
    negative: value < 0,
    hasDecimal: unsigned.includes("."),
  };
}

export function validateNonNegativeNumber(
  raw: string | number,
  options: { field: string },
): ValidationResult {
  const inspected = inspectNumericInput(raw);

  if (inspected.kind === "empty") {
    return { ok: false, error: `${options.field} is required.` };
  }

  if (inspected.kind === "invalid") {
    return { ok: false, error: "Please enter a valid number." };
  }

  if (inspected.negative) {
    return { ok: false, error: `${options.field} cannot be negative.` };
  }

  return { ok: true, value: inspected.value };
}

export function validateNonNegativeInteger(
  raw: string | number,
  options: { field: string },
): ValidationResult {
  const inspected = inspectNumericInput(raw);

  if (inspected.kind === "empty") {
    return { ok: false, error: `${options.field} is required.` };
  }

  if (inspected.kind === "invalid") {
    return { ok: false, error: "Please enter a valid number." };
  }

  if (inspected.hasDecimal) {
    return { ok: false, error: `${options.field} must be a whole number.` };
  }

  if (inspected.negative) {
    return { ok: false, error: `${options.field} cannot be negative.` };
  }

  return { ok: true, value: inspected.value };
}

export function validateQuantity(
  raw: string | number,
  available: number,
): ValidationResult {
  const result = validateNonNegativeInteger(raw, { field: "Quantity" });

  if (!result.ok) {
    return result;
  }

  if (result.value < 1) {
    return { ok: false, error: "Quantity must be at least 1." };
  }

  if (result.value > available) {
    return { ok: false, error: `Only ${available} available.` };
  }

  return result;
}

export type PhoneValidationResult =
  | { ok: true; value?: string }
  | { ok: false; error: string };

export function validateGpayPhone(
  paymentMethod: string | null,
  raw: string,
): PhoneValidationResult {
  if (paymentMethod !== "GPay") {
    return { ok: true };
  }

  const trimmed = raw.trim();

  if (trimmed === "") {
    return { ok: false, error: "Phone number is required for GPay." };
  }

  if (!/^\d{10}$/.test(trimmed)) {
    return { ok: false, error: "Enter a valid 10-digit phone number." };
  }

  return { ok: true, value: trimmed };
}

export function validateProductForm(
  form: ProductFormValues,
  sold: number,
): { product?: NewProduct; errors: ProductFormErrors } {
  const errors: ProductFormErrors = {};

  if (form.type.trim() === "") {
    errors.type = "Type is required.";
  }

  const totalBought = validateNonNegativeInteger(form.totalBought, {
    field: "Total bought",
  });

  if (!totalBought.ok) {
    errors.totalBought = totalBought.error;
  } else {
    const boughtError = getTotalBoughtError(totalBought.value, sold);
    if (boughtError) {
      errors.totalBought = boughtError;
    }
  }

  const costPrice = validateNonNegativeNumber(form.costPrice, {
    field: "Cost price",
  });

  if (!costPrice.ok) {
    errors.costPrice = costPrice.error;
  }

  const sellingPrice = validateNonNegativeNumber(form.sellingPrice, {
    field: "Selling price",
  });

  if (!sellingPrice.ok) {
    errors.sellingPrice = sellingPrice.error;
  }

  if (
    Object.keys(errors).length > 0 ||
    !totalBought.ok ||
    !costPrice.ok ||
    !sellingPrice.ok
  ) {
    return { errors };
  }

  return {
    errors,
    product: {
      type: form.type.trim(),
      subType: form.subType.trim(),
      totalBought: totalBought.value,
      costPrice: costPrice.value,
      sellingPrice: sellingPrice.value,
    },
  };
}

export function firstCartItemFieldError(
  errors: Record<string, CartItemFieldErrors>,
): string | null {
  for (const itemErrors of Object.values(errors)) {
    if (itemErrors.quantity) {
      return itemErrors.quantity;
    }

    if (itemErrors.price) {
      return itemErrors.price;
    }
  }

  return null;
}
