import LifestyleDetailPage from "@/components/lifestyle/LifestyleDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LifestyleDetailedPage({ params }: PageProps) {
  const { id } = await params;
  return <LifestyleDetailPage id={id} />;
}
