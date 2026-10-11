import ExistingRecordDetail from "@/components/common/ExistingRecordDetail";

export default async function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ExistingRecordDetail module="restaurants" id={id} />;
}
