"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addSale } from "@/data/store";
import { navigateWithRouter } from "@/lib/pwa";
import { useProductStock } from "@/hooks/useProductStock";
import { getAvailableStock } from "@/lib/inventory";
import {
  buildNewSale,
  getCartQuantity,
  summarizeCart,
  validateCart,
} from "@/lib/sales";
import {
  firstCartItemFieldError,
  validateGpayPhone,
  validateNonNegativeNumber,
  validateQuantity,
  type CartItemFieldErrors,
} from "@/lib/validation";
import type { CartItem, PaymentMethod, Sale } from "@/types/sale";
import type { ProductWithStock } from "@/types/product";
import { Button } from "@/components/ui/Button";
import { CheckoutBar } from "@/components/ui/CheckoutBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { AddSaleProductModal } from "./AddSaleProductModal";
import { CompleteSaleConfirmDialog } from "./CompleteSaleConfirmDialog";
import { GpayPhoneField } from "./GpayPhoneField";
import { PaymentMethodPicker } from "./PaymentMethodPicker";
import { SaleCartItem } from "./SaleCartItem";
import { SaleCompletedDialog } from "./SaleCompletedDialog";
import { SaleSummary } from "./SaleSummary";

export function NewSaleView() {
  const router = useRouter();
  const products = useProductStock();
  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("GPay");
  const [customerPhone, setCustomerPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemErrors, setItemErrors] = useState<Record<string, CartItemFieldErrors>>(
    {},
  );
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const summary = useMemo(() => summarizeCart(cartItems), [cartItems]);

  function addProductToCart(product: ProductWithStock) {
    const available = getAvailableStock(product.remaining);
    const currentQuantity = getCartQuantity(cartItems, product.id);

    if (currentQuantity >= available) {
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
        },
      ];
    });
    setIsPickerOpen(false);
  }

  function updateQuantity(productId: string, quantity: number) {
    const product = productsById.get(productId);
    const available = product ? getAvailableStock(product.remaining) : 0;

    if (!validateQuantity(quantity, available).ok) {
      return;
    }

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

    setCartItems((current) => {
      const existing = current.find((item) => item.productId === productId);

      if (!existing || existing.actualSellingPrice === price) {
        return current;
      }

      return current.map((item) =>
        item.productId === productId
          ? { ...item, actualSellingPrice: price }
          : item,
      );
    });
  }

  function removeItem(productId: string) {
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

  function handleCompleteSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmittingRef.current || completedSale || isConfirmOpen) {
      return;
    }

    const fieldError = firstCartItemFieldError(itemErrors);

    if (fieldError) {
      setError(fieldError);
      return;
    }

    const validationError = validateCart(cartItems, products, paymentMethod);

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
    setError(null);
    setIsConfirmOpen(true);
  }

  function handleCancelConfirm() {
    if (isSubmittingRef.current) {
      return;
    }

    setIsConfirmOpen(false);
  }

  function handleConfirmSale() {
    if (isSubmittingRef.current || completedSale) {
      return;
    }

    const fieldError = firstCartItemFieldError(itemErrors);

    if (fieldError) {
      setIsConfirmOpen(false);
      setError(fieldError);
      return;
    }

    const validationError = validateCart(cartItems, products, paymentMethod);

    if (validationError) {
      setIsConfirmOpen(false);
      setError(validationError);
      return;
    }

    const phoneResult = validateGpayPhone(paymentMethod, customerPhone);

    if (!phoneResult.ok) {
      setIsConfirmOpen(false);
      setPhoneError(phoneResult.error);
      setError(phoneResult.error);
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const sale = addSale(
        buildNewSale(cartItems, paymentMethod, productsById, phoneResult.value),
      );
      setIsConfirmOpen(false);
      setCompletedSale(sale);
    } catch {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      setError("Could not complete the sale. Please try again.");
    }
  }

  return (
    <>
    <form
      className="space-y-6 pb-[calc(9.5rem+env(safe-area-inset-bottom))]"
      noValidate
      onSubmit={handleCompleteSale}
    >
      <PageHeader
        title="New Sale"
        description="Add products, set prices, and collect payment."
        backHref="/sales"
        action={
          <Button
            size="lg"
            className="w-full sm:h-10 sm:w-auto sm:text-sm"
            onClick={() => setIsPickerOpen(true)}
          >
            + Add Product
          </Button>
        }
      />

      <section className="space-y-3">
        <h2 className="text-[13px] font-medium text-foreground">Add Products</h2>
        {cartItems.length === 0 ? (
          <EmptyState
            title="No items yet"
            description="Tap + Add Product to start the sale."
            action={
              <Button onClick={() => setIsPickerOpen(true)}>+ Add Product</Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <SaleCartItem
                key={item.productId}
                item={item}
                product={productsById.get(item.productId)}
                onQuantityChange={updateQuantity}
                onPriceChange={updatePrice}
                onRemove={removeItem}
                onValidationChange={handleItemValidation}
              />
            ))}
          </div>
        )}
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
            setPaymentMethod(method);
            setPhoneError(undefined);
            setError(null);
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

      <CheckoutBar amount={summary.finalAmount}>
        <div className="flex min-w-0 flex-col items-end gap-2">
          {error ? (
            <p className="max-w-[16rem] text-right text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            size="lg"
            className="flex-1 sm:flex-none"
            disabled={isConfirmOpen || isSubmitting || Boolean(completedSale)}
            onMouseDown={(event) => event.preventDefault()}
          >
            Complete Sale
          </Button>
        </div>
      </CheckoutBar>
    </form>

      {isPickerOpen ? (
        <AddSaleProductModal
          products={products}
          cartItems={cartItems}
          onClose={() => setIsPickerOpen(false)}
          onSelect={addProductToCart}
        />
      ) : null}

      {isConfirmOpen && !completedSale ? (
        <CompleteSaleConfirmDialog
          itemCount={summary.itemCount}
          finalAmount={summary.finalAmount}
          paymentMethod={paymentMethod}
          customerPhone={
            paymentMethod === "GPay" ? customerPhone.trim() : undefined
          }
          isSubmitting={isSubmitting}
          onCancel={handleCancelConfirm}
          onConfirm={handleConfirmSale}
        />
      ) : null}

      {completedSale ? (
        <SaleCompletedDialog
          sale={completedSale}
          onDone={() => navigateWithRouter("/sales", router.push)}
        />
      ) : null}
    </>
  );
}
