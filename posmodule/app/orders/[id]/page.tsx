import ResourceWorkspace from "@/components/common/ResourceWorkspace";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResourceWorkspace module="orders" mode="detail" id={id} />;
}
