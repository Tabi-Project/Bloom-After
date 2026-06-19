"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Lifestyle } from '@/types/lifestyle';

interface CardProps {
  item: Lifestyle;
}

export default function LifestyleCard({ item }: CardProps) {
  // Safe default fallback image matching the aesthetic configuration of your pages
  const image = 'https://unsplash.com';

  return (
    <Link href={`/lifestyle/detail?id=${item.id}`} className="lm-card">
      
      {/* Container must have relative positioning to prevent Next.js Image fill crashes */}
      <div className="ngo-card-image-wrapper" style={{ position: 'relative', height: '220px', width: '100%' }}>
        <Image
          src={image}
          alt={`Cover photo for ${item.title}`}
          fill
          className="ngo-card-image"
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="lm-card-header" style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
          <span className="lm-badge">{item.category}</span>
        </div>
      </div>

      <div className="lm-card-body">
        <h3 className="lm-card-title" style={{ marginTop: 'var(--space-4)' }}>
          {item.title}
        </h3>
        <p className="lm-card-desc">{item.summary}</p>
      </div>
      
      <div className="lm-card-cta">
        Explore Strategy &rarr;
      </div>
    </Link>
  );
}