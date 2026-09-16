import type { PaymentMethod } from "@/types/sale";
import { PAYMENT_METHODS } from "@/types/sale";
import { cn } from "@/lib/cn";

type PaymentMethodPickerProps = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

export function PaymentMethodPicker({
  value,
  onChange,
}: PaymentMethodPickerProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-[13px] font-medium text-foreground">
        Payment
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {PAYMENT_METHODS.map((method) => {
          const selected = method === value;

          return (
            <label
              key={method}
              className={cn(
                "flex h-12 cursor-pointer items-center justify-center rounded-[10px] border px-3 text-sm font-medium transition-colors duration-150",
                selected
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-surface text-secondary hover:bg-background hover:text-foreground",
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={selected}
                onChange={() => onChange(method)}
                className="sr-only"
              />
              {method}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
