"use client";

import { useState, useEffect } from "react";
import ResourceCard, { ResourceCardSkeleton } from "@/components/resources/ResourceCard";
import { fetchResources } from "@/lib/api/resources";
import type { Resource } from "@/lib/api/resources";

interface RelatedResourcesProps {
  resourceId: string;
  theme: string;
}

export default function RelatedResources({ resourceId, theme }: RelatedResourcesProps) {
  const [related, setRelated] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const results = await fetchResources({
          theme,
          exclude_id: resourceId,
          limit: 3,
          published: true,
        });
        setRelated(results);
      } catch {
        setRelated([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [resourceId, theme]);

  if (!loading && related.length === 0) return null;

  return (
    <section className="related-resources" aria-labelledby="related-heading">
      <h2 className="related-heading" id="related-heading">
        More for You
      </h2>
      <div className="related-grid" aria-live="polite">
        {loading
          ? [1, 2, 3].map((i) => <ResourceCardSkeleton key={i} />)
          : related.map((r) => <ResourceCard key={r.id} resource={r} />)}
      </div>
    </section>
  );
}