import ExistingRecordDetail from "@/components/common/ExistingRecordDetail";

export default async function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ExistingRecordDetail module="brands" id={id} />;
}
