'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Plus } from 'lucide-react';
import { Registration, Event } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/context/realtime-context';
import { MyParticipationCard } from '@/components/resident/MyParticipationCard';
import { EmptyState } from '@/components/common/EmptyState';
import { DEMO_EVENT_ID } from '@/lib/demo/demo-data';

export default function MyParticipationPage() {
  const { user } = useAuth();
  const { lastEvent } = useRealtime();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!user) return;
    const allRegs = db.getRegistrations(DEMO_EVENT_ID);
    // Find registrations submitted by current user (or show sample resident registrations)
    let userRegs = allRegs.filter((r) => r.submitted_by === user.id);
    if (userRegs.length === 0) {
      // Default to demo resident act
      userRegs = allRegs.filter((r) => r.id === 'reg-04');
    }
    setRegistrations(userRegs);

    const ev = db.getEvent(DEMO_EVENT_ID);
    if (ev) setEvents([ev]);
  }, [user, lastEvent]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl glass-panel-highlight border border-white/10">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
            Performer Dashboard
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            My Registered Acts & Stage Slots
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review status, assigned sequence number, and uploaded soundtracks for upcoming celebrations.
          </p>
        </div>

        <Link
          href={`/resident/events/${DEMO_EVENT_ID}/register`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Register Another Act</span>
        </Link>
      </div>

      {registrations.length > 0 ? (
        <div className="space-y-6">
          {registrations.map((reg) => (
            <MyParticipationCard
              key={reg.id}
              registration={reg}
              event={events.find((e) => e.id === reg.event_id)}
              performance={reg.performance}
              media={reg.media}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No registered performances yet"
          description="You haven’t submitted any acts for upcoming society cultural nights."
        />
      )}
    </div>
  );
}
