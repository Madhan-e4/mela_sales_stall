const PRODUCTS_KEY = "stall-sales-products";
const SALES_KEY = "stall-sales-sales";
const LEGACY_PRODUCTS_KEY = "stall-sales-manager:products";
const LEGACY_SALES_KEY = "stall-sales-manager:sales";

export const storageKeys = {
  products: PRODUCTS_KEY,
  sales: SALES_KEY,
  legacyProducts: LEGACY_PRODUCTS_KEY,
  legacySales: LEGACY_SALES_KEY,
  seedFlag: "stall-sales-data-seeded-v1",
} as const;

export function readJson<T>(
  key: string,
  isValid: (value: unknown) => value is T,
): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isValid(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota and private-mode write failures.
  }
}

export function removeKey(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage access failures.
  }
}

export function readStoredJson<T>(
  key: string,
  legacyKey: string,
  isValid: (value: unknown) => value is T,
): T | null {
  const current = readJson(key, isValid);

  if (current) {
    return current;
  }

  const legacy = readJson(legacyKey, isValid);

  if (!legacy) {
    return null;
  }

  writeJson(key, legacy);
  removeKey(legacyKey);
  return legacy;
}
