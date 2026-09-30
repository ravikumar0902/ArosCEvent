'use client';

import React from 'react';
import { JudgeManager } from '@/components/admin/JudgeManager';
import { DEMO_EVENT_ID } from '@/lib/demo/demo-data';

export default function JudgesPage() {
  return <JudgeManager eventId={DEMO_EVENT_ID} />;
}
