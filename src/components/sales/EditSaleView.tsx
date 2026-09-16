"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateSale } from "@/data/store";
import { useProductStock } from "@/hooks/useProductStock";
import { useSales } from "@/hooks/useSales";
import {
  buildUpdatedSale,
  getEditStockLimit,
  getEditableStock,
  getOriginalSaleQuantity,
  isSaleDraftChanged,
  saleToCartItems,
  summarizeCart,
  validateEditedSale,
} from "@/lib/sales";
import {
  firstCartItemFieldError,
  validateGpayPhone,
  validateNonNegativeNumber,
  validateQuantity,
  type CartItemFieldErrors,
} from "@/lib/validation";
import { formatSaleDateTime } from "@/lib/salesHistory";
import type { CartItem, PaymentMethod } from "@/types/sale";
import type { ProductWithStock } from "@/types/product";
import { Button } from "@/components/ui/Button";
import { CheckoutBar } from "@/components/ui/CheckoutBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { AddSaleProductModal } from "./AddSaleProductModal";
import { DiscardChangesDialog } from "./DiscardChangesDialog";
import { GpayPhoneField } from "./GpayPhoneField";
import { PaymentMethodPicker } from "./PaymentMethodPicker";
import { SaleCartItem } from "./SaleCartItem";
import { SaleSummary } from "./SaleSummary";

type EditSaleViewProps = {
  saleId: string;
};

type PickerMode = { type: "add" } | { type: "replace"; productId: string };

export function EditSaleView({ saleId }: EditSaleViewProps) {
  const router = useRouter();
  const sales = useSales();
  const products = useProductStock();
  const originalSale = sales.find((sale) => sale.saleId === saleId);

  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    originalSale ? saleToCartItems(originalSale) : [],
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    originalSale?.paymentMethod ?? "GPay",
  );
  const [customerPhone, setCustomerPhone] = useState(
    originalSale?.customerPhone ?? "",
  );
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [pickerMode, setPickerMode] = useState<PickerMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [itemErrors, setItemErrors] = useState<Record<string, CartItemFieldErrors>>(
    {},
  );
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const summary = useMemo(() => summarizeCart(cartItems), [cartItems]);
  const isDirty = originalSale
    ? isSaleDraftChanged(originalSale, cartItems, paymentMethod, customerPhone)
    : false;

  function getMaxQuantity(productId: string): number {
    if (!originalSale) {
      return 1;
    }

    const product = productsById.get(productId);
    const originalQuantity = getOriginalSaleQuantity(originalSale, productId);

    if (!product) {
      return Math.max(1, originalQuantity);
    }

    return getEditStockLimit(product.remaining, originalQuantity);
  }

  function addProductToCart(product: ProductWithStock) {
    if (!originalSale) {
      return;
    }

    const available = getEditableStock(product, cartItems, originalSale);

    if (available <= 0) {
      return;
    }

    setError(null);
    setCartItems((current) => {
      const existing = current.find((item) => item.productId === product.id);

      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          quantity: 1,
          cataloguePrice: product.sellingPrice,
          actualSellingPrice: product.sellingPrice,
          productType: product.type,
          productSubType: product.subType,
        },
      ];
    });
    setPickerMode(null);
  }

  function replaceProduct(fromProductId: string, product: ProductWithStock) {
    if (!originalSale) {
      return;
    }

    setError(null);
    setCartItems((current) => {
      const fromItem = current.find((item) => item.productId === fromProductId);

      if (!fromItem) {
        return current;
      }

      if (fromProductId === product.id) {
        return current;
      }

      const available = getEditableStock(product, current, originalSale, {
        ignoreCartProductId: fromProductId,
      });

      if (available < 1) {
        return current;
      }

      const withoutFrom = current.filter((item) => item.productId !== fromProductId);
      const existing = withoutFrom.find((item) => item.productId === product.id);
      const nextQuantity = Math.min(fromItem.quantity, available);

      if (existing) {
        const merged = Math.min(existing.quantity + fromItem.quantity, available);

        if (merged < 1) {
          return current;
        }

        return withoutFrom.map((item) =>
          item.productId === product.id ? { ...item, quantity: merged } : item,
        );
      }

      return [
        ...withoutFrom,
        {
          productId: product.id,
          quantity: nextQuantity,
          cataloguePrice: product.sellingPrice,
          actualSellingPrice: product.sellingPrice,
          productType: product.type,
          productSubType: product.subType,
        },
      ];
    });
    setPickerMode(null);
  }

  function updateQuantity(productId: string, quantity: number) {
    const maxQuantity = getMaxQuantity(productId);

    if (!validateQuantity(quantity, maxQuantity).ok) {
      return;
    }

    setError(null);
    setCartItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  }

  function handleItemValidation(productId: string, errors: CartItemFieldErrors) {
    setItemErrors((current) => {
      const hasErrors = Boolean(errors.quantity || errors.price);

      if (!hasErrors) {
        if (!(productId in current)) {
          return current;
        }

        const { [productId]: _removed, ...rest } = current;
        return rest;
      }

      const previous = current[productId];

      if (
        previous?.quantity === errors.quantity &&
        previous?.price === errors.price
      ) {
        return current;
      }

      return { ...current, [productId]: errors };
    });
    setError(null);
  }

  function updatePrice(productId: string, price: number) {
    if (!validateNonNegativeNumber(price, { field: "Price" }).ok) {
      return;
    }

    setError(null);
    setCartItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, actualSellingPrice: price }
          : item,
      ),
    );
  }

  function removeItem(productId: string) {
    if (cartItems.length <= 1) {
      setError("A sale must contain at least one item.");
      return;
    }

    setError(null);
    setItemErrors((current) => {
      if (!(productId in current)) {
        return current;
      }

      const { [productId]: _removed, ...rest } = current;
      return rest;
    });
    setCartItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!originalSale) {
      return;
    }

    const fieldError = firstCartItemFieldError(itemErrors);

    if (fieldError) {
      setError(fieldError);
      return;
    }

    const validationError = validateEditedSale(
      cartItems,
      products,
      paymentMethod,
      originalSale,
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    const phoneResult = validateGpayPhone(paymentMethod, customerPhone);

    if (!phoneResult.ok) {
      setPhoneError(phoneResult.error);
      setError(phoneResult.error);
      return;
    }

    setPhoneError(undefined);

    const nextSale = buildUpdatedSale(
      originalSale,
      cartItems,
      paymentMethod,
      productsById,
      phoneResult.value,
    );

    updateSale(originalSale.saleId, {
      items: nextSale.items,
      paymentMethod: nextSale.paymentMethod,
      customerPhone: nextSale.customerPhone ?? null,
      subtotal: nextSale.subtotal,
      totalDiscount: nextSale.totalDiscount,
      finalAmount: nextSale.finalAmount,
    });

    router.push("/sales");
  }

  function handleCancel() {
    if (isDirty) {
      setIsDiscardOpen(true);
      return;
    }

    router.push("/sales");
  }

  if (!originalSale) {
    return (
      <PageHeader
        title="Sale not found"
        description="This sale is not available."
        backHref="/sales"
      />
    );
  }

  return (
    <>
    <form
      className="space-y-6 pb-[calc(9.5rem+env(safe-area-inset-bottom))]"
      noValidate
      onSubmit={handleSave}
    >
      <PageHeader
        title="Edit Sale"
        onBack={handleCancel}
        action={
          <Button
            size="lg"
            className="w-full sm:h-10 sm:w-auto sm:text-sm"
            onClick={() => setPickerMode({ type: "add" })}
          >
            + Add Product
          </Button>
        }
      />

      <section className="space-y-3">
        <h2 className="text-[13px] font-medium text-foreground">Sale information</h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
              Sale ID
            </dt>
            <dd className="mt-1 font-medium text-foreground">{originalSale.saleId}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
              Date & Time
            </dt>
            <dd className="mt-1 text-secondary">
              {formatSaleDateTime(originalSale.createdAt)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3">
        <h2 className="text-[13px] font-medium text-foreground">Items</h2>
        {cartItems.map((item) => (
          <SaleCartItem
            key={item.productId}
            item={item}
            product={productsById.get(item.productId)}
            maxQuantity={getMaxQuantity(item.productId)}
            showDiscount
            onQuantityChange={updateQuantity}
            onPriceChange={updatePrice}
            onRemove={removeItem}
            onChangeProduct={(productId) =>
              setPickerMode({ type: "replace", productId })
            }
            onValidationChange={handleItemValidation}
          />
        ))}
      </section>

      <SaleSummary
        subtotal={summary.subtotal}
        totalDiscount={summary.totalDiscount}
        finalAmount={summary.finalAmount}
      />

      <div className="space-y-3">
        <PaymentMethodPicker
          value={paymentMethod}
          onChange={(method) => {
            setError(null);
            setPhoneError(undefined);
            setPaymentMethod(method);
          }}
        />
        {paymentMethod === "GPay" ? (
          <GpayPhoneField
            value={customerPhone}
            error={phoneError}
            onChange={(value) => {
              setCustomerPhone(value);
              if (phoneError) {
                const result = validateGpayPhone("GPay", value);
                setPhoneError(result.ok ? undefined : result.error);
                if (result.ok) {
                  setError(null);
                }
              }
            }}
          />
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <CheckoutBar amount={summary.finalAmount}>
        <Button variant="secondary" size="lg" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" size="lg" className="flex-1 sm:flex-none">
          Save Changes
        </Button>
      </CheckoutBar>
    </form>

      {pickerMode ? (
        <AddSaleProductModal
          products={products}
          cartItems={cartItems}
          getAvailable={(product) =>
            originalSale
              ? getEditableStock(product, cartItems, originalSale, {
                  ignoreCartProductId:
                    pickerMode.type === "replace"
                      ? pickerMode.productId
                      : undefined,
                })
              : 0
          }
          onClose={() => setPickerMode(null)}
          onSelect={(product) => {
            if (pickerMode.type === "replace") {
              replaceProduct(pickerMode.productId, product);
              return;
            }

            addProductToCart(product);
          }}
        />
      ) : null}

      {isDiscardOpen ? (
        <DiscardChangesDialog
          onKeepEditing={() => setIsDiscardOpen(false)}
          onDiscard={() => router.push("/sales")}
        />
      ) : null}
    </>
  );
}
