'use client';

import React from 'react';
import { VolunteerManager } from '@/components/admin/VolunteerManager';
import { DEMO_EVENT_ID } from '@/lib/demo/demo-data';

export default function VolunteersPage() {
  return <VolunteerManager eventId={DEMO_EVENT_ID} />;
}
