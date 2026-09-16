export type Product = {
  id: string;
  type: string;
  subType: string;
  totalBought: number;
  costPrice: number;
  sellingPrice: number;
};

export type NewProduct = Omit<Product, "id">;

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type ProductWithStock = Product & {
  sold: number;
  remaining: number;
  stockStatus: StockStatus;
};
