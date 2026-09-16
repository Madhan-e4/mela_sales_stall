"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { NewProduct, Product } from "@/types/product";
import {
  validateProductForm,
  type ProductFormErrors,
  type ProductFormValues,
} from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type ProductFormModalProps = {
  product?: Product | null;
  sold?: number;
  onClose: () => void;
  onSave: (product: NewProduct) => void;
};

const EMPTY_FORM: ProductFormValues = {
  type: "",
  subType: "",
  totalBought: "",
  costPrice: "0",
  sellingPrice: "",
};

function toFormState(product?: Product | null): ProductFormValues {
  if (!product) {
    return EMPTY_FORM;
  }

  return {
    type: product.type,
    subType: product.subType,
    totalBought: String(product.totalBought),
    costPrice: String(product.costPrice),
    sellingPrice: String(product.sellingPrice),
  };
}

export function ProductFormModal({
  product,
  sold = 0,
  onClose,
  onSave,
}: ProductFormModalProps) {
  const isEditing = Boolean(product);
  const typeInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProductFormValues>(() => toFormState(product));
  const [errors, setErrors] = useState<ProductFormErrors>({});

  useEffect(() => {
    typeInputRef.current?.focus();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateProductForm(form, sold);
    setErrors(result.errors);

    if (!result.product) {
      return;
    }

    onSave(result.product);
  }

  function updateField(field: keyof ProductFormValues, value: string) {
    const next = { ...form, [field]: value };
    setForm(next);
    setErrors((current) =>
      Object.keys(current).length === 0
        ? current
        : validateProductForm(next, sold).errors,
    );
  }

  return (
    <Modal
      title={isEditing ? "Edit Product" : "Add Product"}
      onClose={onClose}
    >
      <form className="mt-5 space-y-4" noValidate onSubmit={handleSubmit}>
        <Field label="Type" error={errors.type}>
          <Input
            ref={typeInputRef}
            invalid={Boolean(errors.type)}
            value={form.type}
            onChange={(event) => updateField("type", event.target.value)}
            placeholder="Saree, Blouse, Churidhar"
          />
        </Field>

        <Field label="Sub-Type">
          <Input
            value={form.subType}
            onChange={(event) => updateField("subType", event.target.value)}
            placeholder="Optional"
          />
        </Field>

        <Field label="Total Bought" error={errors.totalBought}>
          <Input
            invalid={Boolean(errors.totalBought)}
            inputMode="numeric"
            autoComplete="off"
            value={form.totalBought}
            onChange={(event) => updateField("totalBought", event.target.value)}
          />
        </Field>

        {isEditing ? (
          <div>
            <p className="text-[13px] font-medium text-foreground">Sold</p>
            <p className="mt-1.5 text-sm text-secondary">
              {sold} (from sales, not editable)
            </p>
          </div>
        ) : null}

        <Field label="Cost Price" error={errors.costPrice}>
          <Input
            invalid={Boolean(errors.costPrice)}
            inputMode="decimal"
            autoComplete="off"
            value={form.costPrice}
            onChange={(event) => updateField("costPrice", event.target.value)}
          />
        </Field>

        <Field label="Selling Price" error={errors.sellingPrice}>
          <Input
            invalid={Boolean(errors.sellingPrice)}
            inputMode="decimal"
            autoComplete="off"
            value={form.sellingPrice}
            onChange={(event) => updateField("sellingPrice", event.target.value)}
          />
        </Field>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Product</Button>
        </div>
      </form>
    </Modal>
  );
}
