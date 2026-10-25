import ResourceWorkspace from "@/components/common/ResourceWorkspace";

export default async function EditTablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResourceWorkspace module="tables" mode="edit" id={id} />;
}
