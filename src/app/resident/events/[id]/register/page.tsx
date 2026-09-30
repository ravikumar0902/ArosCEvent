'use client';

import React, { use, useState, useEffect } from 'react';
import { RegistrationWizard } from '@/components/resident/RegistrationWizard';
import { db } from '@/lib/services/data-store';
import { Event, EventCategory } from '@/types/database';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RegisterActPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [categories, setCategories] = useState<EventCategory[]>([]);

  useEffect(() => {
    const ev = db.getEvent(resolvedParams.id);
    setEvent(ev);
    if (ev) {
      setCategories(db.getCategories(ev.society_id));
    }
  }, [resolvedParams.id]);

  if (!event) {
    return <div className="p-8 text-center text-slate-400">Event not found.</div>;
  }

  return (
    <div className="space-y-6">
      <RegistrationWizard event={event} categories={categories} />
    </div>
  );
}
