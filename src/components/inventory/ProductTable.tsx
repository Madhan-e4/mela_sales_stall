import type { ProductWithStock } from "@/types/product";
import { displaySubType, formatInr } from "@/lib/inventory";
import { Button } from "@/components/ui/Button";
import { Table, THead, TH, TR, TD } from "@/components/ui/Table";
import { StockStatusBadge } from "./StockStatusBadge";

type ProductTableProps = {
  products: ProductWithStock[];
  onEdit: (product: ProductWithStock) => void;
  onDelete: (product: ProductWithStock) => void;
};

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <Table minWidthClassName="min-w-[44rem]">
      <THead>
        <tr>
          <TH>Product</TH>
          <TH>Sub-Type</TH>
          <TH align="right">Bought</TH>
          <TH align="right">Sold</TH>
          <TH align="right">Remaining</TH>
          <TH align="right">Selling Price</TH>
          <TH>Status</TH>
          <TH align="right">Actions</TH>
        </tr>
      </THead>
      <tbody>
        {products.map((product) => (
          <TR key={product.id}>
            <TD className="font-medium text-foreground">{product.type}</TD>
            <TD className="text-secondary">{displaySubType(product.subType)}</TD>
            <TD align="right" numeric>
              {product.totalBought}
            </TD>
            <TD align="right" numeric>
              {product.sold}
            </TD>
            <TD align="right" numeric className="font-medium">
              {product.remaining}
            </TD>
            <TD align="right" numeric>
              {formatInr(product.sellingPrice)}
            </TD>
            <TD>
              <StockStatusBadge status={product.stockStatus} />
            </TD>
            <TD align="right">
              <div className="inline-flex items-center justify-end gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => onEdit(product)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-danger hover:bg-danger-soft hover:text-danger"
                  onClick={() => onDelete(product)}
                >
                  Delete
                </Button>
              </div>
            </TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );
}
