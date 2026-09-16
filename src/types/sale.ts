export type PaymentMethod = "Cash" | "GPay" | "Pending Payment" | "Other UPI";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "GPay",
  "Pending Payment",
];

export const KNOWN_PAYMENT_METHODS: readonly PaymentMethod[] = [
  ...PAYMENT_METHODS,
  "Other UPI",
];

export const COLLECTED_PAYMENT_METHODS = ["Cash", "GPay"] as const;

export type CollectedPaymentMethod = (typeof COLLECTED_PAYMENT_METHODS)[number];

export type SaleItem = {
  productId: string;
  productType?: string;
  productSubType?: string;
  quantity: number;
  cataloguePrice: number;
  actualSellingPrice: number;
  lineTotal: number;
  discount: number;
};

export type Sale = {
  saleId: string;
  createdAt: string;
  items: SaleItem[];
  paymentMethod: PaymentMethod;
  customerPhone?: string;
  subtotal: number;
  totalDiscount: number;
  finalAmount: number;
};

export type CartItem = {
  productId: string;
  quantity: number;
  cataloguePrice: number;
  actualSellingPrice: number;
  productType?: string;
  productSubType?: string;
};

export type NewSale = Omit<Sale, "saleId" | "createdAt">;
