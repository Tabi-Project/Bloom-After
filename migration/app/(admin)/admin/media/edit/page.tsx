
import MediaEdit from "@/components/admin/MediaEdit";

interface PageProps {
  params: { id: string };
}

export default function MediaEditPage({ params }: PageProps) {
  return <MediaEdit id={params.id} />;
}