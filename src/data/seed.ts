import { INITIAL_PRODUCTS } from "./products";
import { INITIAL_SALES } from "./sales";
import { storageKeys, writeJson } from "./storage";

export function ensureInitialSeed(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (window.localStorage.getItem(storageKeys.seedFlag) === "1") {
      return;
    }
  } catch {
    return;
  }

  writeJson(storageKeys.products, INITIAL_PRODUCTS);
  writeJson(storageKeys.sales, INITIAL_SALES);

  try {
    window.localStorage.setItem(storageKeys.seedFlag, "1");
  } catch {
    // Ignore quota and private-mode write failures.
  }
}
