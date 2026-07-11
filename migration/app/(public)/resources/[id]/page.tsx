import ResourceDetailPage from "@/components/resources/ResourceDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResourceDetailedPage({ params }: PageProps) {
  const { id } = await params;
  return <ResourceDetailPage id={id} />;
}