"use client";

import { useMemo } from "react";
import { attachStock, getSoldByProductId } from "@/lib/inventory";
import { useProducts } from "./useProducts";
import { useSales } from "./useSales";

export function useProductStock() {
  const products = useProducts();
  const sales = useSales();

  return useMemo(() => {
    const soldByProductId = getSoldByProductId(sales);

    return products.map((product) =>
      attachStock(product, soldByProductId.get(product.id) ?? 0),
    );
  }, [products, sales]);
}
