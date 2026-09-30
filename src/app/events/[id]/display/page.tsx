'use client';

import React, { use } from 'react';
import { EventDisplayMode } from '@/components/display/EventDisplayMode';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DisplayPage({ params }: PageProps) {
  const resolvedParams = use(params);
  return <EventDisplayMode eventId={resolvedParams.id} />;
}
