import { Field, Input } from "@/components/ui/Input";

type GpayPhoneFieldProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function GpayPhoneField({
  value,
  error,
  onChange,
}: GpayPhoneFieldProps) {
  return (
    <Field
      label="Customer Phone Number *"
      htmlFor="customer-phone"
      error={error}
    >
      <Input
        id="customer-phone"
        name="customerPhone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        invalid={Boolean(error)}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}
