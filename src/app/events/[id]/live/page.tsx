'use client';

import React, { use } from 'react';
import { LiveCommandCenter } from '@/components/live/LiveCommandCenter';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LivePage({ params }: PageProps) {
  const resolvedParams = use(params);
  return <LiveCommandCenter eventId={resolvedParams.id} />;
}
