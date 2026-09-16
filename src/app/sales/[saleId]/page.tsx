import { SaleDetailsView } from "@/components/sales/SaleDetailsView";

type SaleDetailsPageProps = {
  params: Promise<{ saleId: string }>;
};

export default async function SaleDetailsPage({ params }: SaleDetailsPageProps) {
  const { saleId } = await params;

  return <SaleDetailsView saleId={saleId} />;
}
