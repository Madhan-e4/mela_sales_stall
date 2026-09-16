export {
  addProduct,
  deleteProduct,
  getProducts,
  getServerProducts,
  hydrateProducts,
  subscribeProducts,
  updateProduct,
} from "./productStore";
export {
  addSale,
  getSaleById,
  getSales,
  getServerSales,
  hydrateSales,
  subscribeSales,
  updateSale,
} from "./saleStore";

import { hydrateProducts } from "./productStore";
import { hydrateSales } from "./saleStore";
import { ensureInitialSeed } from "./seed";

export function hydrateAppData(): void {
  ensureInitialSeed();
  hydrateProducts();
  hydrateSales();
}
