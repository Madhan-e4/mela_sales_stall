"use client";

import { useEffect, useRef, useState } from "react";
import type { CartItem } from "@/types/sale";
import type { ProductWithStock } from "@/types/product";
import { displaySubType, formatInr, getAvailableStock } from "@/lib/inventory";
import { getLineDiscount, getLineTotal } from "@/lib/sales";
import {
  validateNonNegativeNumber,
  validateQuantity,
  type CartItemFieldErrors,
} from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type SaleCartItemProps = {
  item: CartItem;
  product: ProductWithStock | undefined;
  maxQuantity?: number;
  showDiscount?: boolean;
  onQuantityChange: (productId: string, quantity: number) => void;
  onPriceChange: (productId: string, price: number) => void;
  onRemove: (productId: string) => void;
  onChangeProduct?: (productId: string) => void;
  onValidationChange?: (productId: string, errors: CartItemFieldErrors) => void;
};

export function SaleCartItem({
  item,
  product,
  maxQuantity,
  showDiscount = false,
  onQuantityChange,
  onPriceChange,
  onRemove,
  onChangeProduct,
  onValidationChange,
}: SaleCartItemProps) {
  const [quantityDraft, setQuantityDraft] = useState(String(item.quantity));
  const [priceDraft, setPriceDraft] = useState(String(item.actualSellingPrice));
  const [quantityError, setQuantityError] = useState<string | undefined>();
  const [priceError, setPriceError] = useState<string | undefined>();
  const onValidationChangeRef = useRef(onValidationChange);
  const priceErrorRef = useRef(priceError);
  const quantityLimit =
    maxQuantity ??
    (product ? getAvailableStock(product.remaining) : item.quantity);
  const lineTotal = getLineTotal(item);
  const discount = getLineDiscount(item);
  const displayType = item.productType ?? product?.type ?? "Unknown product";
  const displaySubTypeValue = item.productSubType ?? product?.subType ?? "";
  const quantityLabel = showDiscount ? "Quantity" : "Qty";
  const priceLabel = showDiscount ? "Actual Selling Price" : "Unit Price";

  onValidationChangeRef.current = onValidationChange;
  priceErrorRef.current = priceError;

  useEffect(() => {
    setQuantityDraft(String(item.quantity));
    setQuantityError(undefined);
    onValidationChangeRef.current?.(item.productId, {
      ...(priceErrorRef.current ? { price: priceErrorRef.current } : {}),
    });
  }, [item.productId, item.quantity]);

  function reportErrors(nextQuantityError?: string, nextPriceError?: string) {
    onValidationChangeRef.current?.(item.productId, {
      ...(nextQuantityError ? { quantity: nextQuantityError } : {}),
      ...(nextPriceError ? { price: nextPriceError } : {}),
    });
  }

  function handleQuantityDraftChange(value: string) {
    setQuantityDraft(value);
    const result = validateQuantity(value, quantityLimit);

    if (!result.ok) {
      setQuantityError(result.error);
      reportErrors(result.error, priceError);
      return;
    }

    setQuantityError(undefined);
    reportErrors(undefined, priceError);

    if (result.value !== item.quantity) {
      onQuantityChange(item.productId, result.value);
    }
  }

  function applyQuantity(next: number) {
    const result = validateQuantity(next, quantityLimit);

    if (!result.ok) {
      setQuantityError(result.error);
      reportErrors(result.error, priceError);
      return;
    }

    setQuantityDraft(String(result.value));
    setQuantityError(undefined);
    reportErrors(undefined, priceError);

    if (result.value !== item.quantity) {
      onQuantityChange(item.productId, result.value);
    }
  }

  function handlePriceDraftChange(value: string) {
    setPriceDraft(value);
    const result = validateNonNegativeNumber(value, { field: "Price" });

    if (!result.ok) {
      setPriceError(result.error);
      reportErrors(quantityError, result.error);
      return;
    }

    setPriceError(undefined);
    reportErrors(quantityError, undefined);

    if (result.value !== item.actualSellingPrice) {
      onPriceChange(item.productId, result.value);
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium text-foreground">{displayType}</h3>
          <p className="mt-0.5 text-sm text-secondary">
            {displaySubType(displaySubTypeValue)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 px-2 text-danger hover:bg-danger-soft hover:text-danger"
          onClick={() => onRemove(item.productId)}
        >
          Remove
        </Button>
      </div>

      {onChangeProduct ? (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 h-8 px-2"
          onClick={() => onChangeProduct(item.productId)}
        >
          Change product
        </Button>
      ) : null}

      <div className="mt-4 grid grid-cols-1 items-start gap-x-6 gap-y-1.5 md:grid-cols-[repeat(2,minmax(0,1fr))]">
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted md:col-start-1 md:row-start-1">
          {quantityLabel}
        </p>
        <div className="flex h-11 w-fit items-center gap-2 md:col-start-1 md:row-start-2">
          <button
            type="button"
            aria-label={`Decrease ${displayType} quantity`}
            disabled={item.quantity <= 1}
            onClick={() => applyQuantity(item.quantity - 1)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-border text-lg font-medium text-foreground transition-colors hover:bg-background disabled:opacity-40"
          >
            −
          </button>
          <span className="block w-14 shrink-0">
            <Input
              aria-label={`${displayType} quantity`}
              inputMode="numeric"
              autoComplete="off"
              invalid={Boolean(quantityError)}
              value={quantityDraft}
              onChange={(event) => handleQuantityDraftChange(event.target.value)}
              className="text-center tabular-nums"
            />
          </span>
          <button
            type="button"
            aria-label={`Increase ${displayType} quantity`}
            disabled={item.quantity >= quantityLimit}
            onClick={() => applyQuantity(item.quantity + 1)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-border text-lg font-medium text-foreground transition-colors hover:bg-background disabled:opacity-40"
          >
            +
          </button>
        </div>
        <div className="flex min-h-0 items-start md:col-start-1 md:row-start-3 md:min-h-5">
          {quantityError ? (
            <p className="text-xs leading-5 text-danger" role="alert">
              {quantityError}
            </p>
          ) : null}
        </div>

        <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.06em] text-muted md:col-start-2 md:row-start-1 md:mt-0">
          {priceLabel}
        </p>
        <div className="flex h-11 min-w-0 items-center gap-1.5 md:col-start-2 md:row-start-2">
          <span className="shrink-0 text-sm text-secondary">₹</span>
          <span className="block w-full min-w-0 md:w-32">
            <Input
              aria-label={`${displayType} ${priceLabel}`}
              inputMode="decimal"
              autoComplete="off"
              invalid={Boolean(priceError)}
              value={priceDraft}
              onChange={(event) => handlePriceDraftChange(event.target.value)}
              className="text-right tabular-nums"
            />
          </span>
        </div>
        <div className="flex min-h-0 items-start md:col-start-2 md:row-start-3 md:min-h-5">
          {priceError ? (
            <p className="text-xs leading-5 text-danger" role="alert">
              {priceError}
            </p>
          ) : null}
        </div>
        <div className="space-y-2 md:col-start-2 md:row-start-4">
          <p className="text-xs text-muted">
            {showDiscount ? "Catalogue Price" : "Catalogue"}{" "}
            {formatInr(item.cataloguePrice)}
          </p>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
              Line Total
            </span>
            <span className="text-base font-semibold tabular-nums text-foreground">
              {formatInr(lineTotal)}
            </span>
          </div>
          {showDiscount ? (
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
                Discount
              </span>
              <span className="text-sm tabular-nums text-foreground">
                {formatInr(discount)}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
