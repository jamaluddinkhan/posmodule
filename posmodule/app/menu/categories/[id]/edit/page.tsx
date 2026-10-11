import ResourceWorkspace from "@/components/common/ResourceWorkspace";

export default async function EditMenuCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResourceWorkspace module="categories" mode="edit" id={id} />;
}
