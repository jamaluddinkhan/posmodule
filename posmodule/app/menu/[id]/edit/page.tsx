import ResourceWorkspace from "@/components/common/ResourceWorkspace";

export default async function EditMenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResourceWorkspace module="menu" mode="edit" id={id} />;
}
