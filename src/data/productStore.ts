import type { NewProduct, Product } from "@/types/product";
import { INITIAL_PRODUCTS } from "./products";
import { readStoredJson, storageKeys, writeJson } from "./storage";
import { isProductArray } from "./validators";

let products: Product[] = INITIAL_PRODUCTS;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function persist() {
  writeJson(storageKeys.products, products);
}

export function getProducts(): Product[] {
  hydrateProducts();
  return products;
}

export function getServerProducts(): Product[] {
  return INITIAL_PRODUCTS;
}

export function hydrateProducts(): void {
  if (hydrated || typeof window === "undefined") {
    return;
  }

  hydrated = true;
  const stored = readStoredJson(
    storageKeys.products,
    storageKeys.legacyProducts,
    isProductArray,
  );

  if (stored) {
    products = stored;
    return;
  }

  persist();
}

export function addProduct(input: NewProduct): Product {
  hydrateProducts();
  const product: Product = {
    ...input,
    id: crypto.randomUUID(),
  };

  products = [product, ...products];
  persist();
  emit();
  return product;
}

export function updateProduct(id: string, input: NewProduct): void {
  hydrateProducts();
  products = products.map((product) =>
    product.id === id ? { id, ...input } : product,
  );
  persist();
  emit();
}

export function deleteProduct(id: string): void {
  hydrateProducts();
  products = products.filter((product) => product.id !== id);
  persist();
  emit();
}

export function subscribeProducts(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
