import ResourceWorkspace from "@/components/common/ResourceWorkspace";

export default async function MenuCategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResourceWorkspace module="categories" mode="detail" id={id} />;
}
