'use client';

import React from 'react';
import { ReportsViewer } from '@/components/admin/ReportsViewer';
import { DEMO_EVENT_ID } from '@/lib/demo/demo-data';

export default function ReportsPage() {
  return <ReportsViewer eventId={DEMO_EVENT_ID} />;
}
