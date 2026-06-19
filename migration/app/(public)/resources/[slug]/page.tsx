import ResourceDetailPage from "@/components/resources/ResourceDetailPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ResourceDetailedPage({ params }: PageProps) {
  const { slug } = await params;
  return <ResourceDetailPage id={slug} />;
}