"use client";

import { useMemo, useState } from "react";
import type { CartItem } from "@/types/sale";
import type { ProductWithStock } from "@/types/product";
import { displaySubType, filterProducts, formatInr } from "@/lib/inventory";
import { getSelectableStock } from "@/lib/sales";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type AddSaleProductModalProps = {
  products: ProductWithStock[];
  cartItems: CartItem[];
  getAvailable?: (product: ProductWithStock) => number;
  onClose: () => void;
  onSelect: (product: ProductWithStock) => void;
};

export function AddSaleProductModal({
  products,
  cartItems,
  getAvailable,
  onClose,
  onSelect,
}: AddSaleProductModalProps) {
  const [query, setQuery] = useState("");

  const visibleProducts = useMemo(
    () => filterProducts(products, query, { matchPrice: true }),
    [products, query],
  );

  return (
    <Modal title="Add Product" onClose={onClose}>
      <label className="mt-4 block">
        <span className="sr-only">Search products</span>
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by product, type, sub-type or price"
        />
      </label>

      <div className="-mx-5 mt-4 min-h-0 max-h-[min(52dvh,24rem)] overflow-y-auto border-t border-border">
        {visibleProducts.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-secondary">
            No products match your search.
          </p>
        ) : (
          <ul>
            {visibleProducts.map((product) => {
              const available =
                getAvailable?.(product) ??
                getSelectableStock(product, cartItems);
              const disabled = available <= 0;

              return (
                <li
                  key={product.id}
                  className="border-b border-border/80 last:border-b-0"
                >
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(product)}
                    className="flex w-full items-start justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <span>
                      <span className="block font-medium text-foreground">
                        {product.type}
                      </span>
                      <span className="mt-0.5 block text-sm text-secondary">
                        {displaySubType(product.subType)}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block font-medium tabular-nums text-foreground">
                        {formatInr(product.sellingPrice)}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted">
                        {disabled ? "Out of stock" : `${available} available`}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
