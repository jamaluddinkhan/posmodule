import ResourceWorkspace from "@/components/common/ResourceWorkspace";

export default async function TableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResourceWorkspace module="tables" mode="detail" id={id} />;
}
