import ResourceWorkspace from "@/components/common/ResourceWorkspace";

export default async function MenuItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResourceWorkspace module="menu" mode="detail" id={id} />;
}
