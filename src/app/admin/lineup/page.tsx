'use client';

import React from 'react';
import { LineupBuilder } from '@/components/admin/LineupBuilder';
import { DEMO_EVENT_ID } from '@/lib/demo/demo-data';

export default function LineupPage() {
  return <LineupBuilder eventId={DEMO_EVENT_ID} />;
}
