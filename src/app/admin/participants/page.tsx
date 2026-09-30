'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ParticipantTable } from '@/components/admin/ParticipantTable';
import { DEMO_EVENT_ID } from '@/lib/demo/demo-data';

function ParticipantPageContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('selected') || undefined;

  return <ParticipantTable eventId={DEMO_EVENT_ID} initialSelectedId={selectedId} />;
}

export default function ParticipantsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading participant submissions...</div>}>
      <ParticipantPageContent />
    </Suspense>
  );
}
