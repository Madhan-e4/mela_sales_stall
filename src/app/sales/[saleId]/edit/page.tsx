import { EditSaleView } from "@/components/sales/EditSaleView";

type EditSalePageProps = {
  params: Promise<{ saleId: string }>;
};

export default async function EditSalePage({ params }: EditSalePageProps) {
  const { saleId } = await params;

  return <EditSaleView key={saleId} saleId={saleId} />;
}
