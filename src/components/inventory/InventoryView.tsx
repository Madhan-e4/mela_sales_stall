"use client";

import { useMemo, useState } from "react";
import {
  addProduct,
  deleteProduct,
  updateProduct,
} from "@/data/store";
import { filterProducts, productHasSales } from "@/lib/inventory";
import { exportInventoryCsv } from "@/lib/csvExport";
import { useProductStock } from "@/hooks/useProductStock";
import { useSales } from "@/hooks/useSales";
import type { NewProduct, ProductWithStock } from "@/types/product";
import { CsvExportButton } from "@/components/CsvExportButton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { ProductFormModal } from "./ProductFormModal";
import { ProductTable } from "./ProductTable";

export function InventoryView() {
  const products = useProductStock();
  const sales = useSales();
  const [query, setQuery] = useState("");
  const [formProduct, setFormProduct] = useState<
    ProductWithStock | null | undefined
  >(undefined);
  const [productToDelete, setProductToDelete] =
    useState<ProductWithStock | null>(null);

  const isFormOpen = formProduct !== undefined;

  const visibleProducts = useMemo(
    () => filterProducts(products, query),
    [products, query],
  );

  function handleSave(data: NewProduct) {
    if (formProduct) {
      updateProduct(formProduct.id, data);
    } else {
      addProduct(data);
    }

    setFormProduct(undefined);
  }

  function handleConfirmDelete() {
    if (!productToDelete) {
      return;
    }

    deleteProduct(productToDelete.id);
    setProductToDelete(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory"
        description="Catalogue, stock levels, and selling prices."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-start">
            <CsvExportButton onExport={() => exportInventoryCsv(products)} />
            <Button
              size="lg"
              className="w-full sm:h-10 sm:w-auto sm:text-sm"
              onClick={() => setFormProduct(null)}
            >
              + Add Product
            </Button>
          </div>
        }
      />

      <label className="block">
        <span className="sr-only">Search products</span>
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by type or sub-type"
        />
      </label>

      {visibleProducts.length === 0 ? (
        <EmptyState
          title={query.trim() ? "No matching products" : "No products yet"}
          description={
            query.trim()
              ? "Try a different type or sub-type."
              : "Add your first catalogue item to start tracking stock."
          }
          action={
            query.trim() ? undefined : (
              <Button onClick={() => setFormProduct(null)}>+ Add Product</Button>
            )
          }
        />
      ) : (
        <ProductTable
          products={visibleProducts}
          onEdit={(product) => setFormProduct(product)}
          onDelete={setProductToDelete}
        />
      )}

      {isFormOpen ? (
        <ProductFormModal
          key={formProduct?.id ?? "new"}
          product={formProduct}
          sold={formProduct?.sold ?? 0}
          onClose={() => setFormProduct(undefined)}
          onSave={handleSave}
        />
      ) : null}

      {productToDelete ? (
        <DeleteConfirmationDialog
          productName={productToDelete.type}
          hasSalesHistory={productHasSales(sales, productToDelete.id)}
          onCancel={() => setProductToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </div>
  );
}
