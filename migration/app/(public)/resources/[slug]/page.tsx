import ResourceDetailPage from "@/components/resources/ResourceDetailPage";

interface PageProps {
  params: { id: string };
}

export default function ResourceDetailPage({ params }: PageProps) {
  return <ResourceDetailPage id={params.id} />;
}