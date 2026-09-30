'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  Trophy,
  Megaphone,
  ArrowRight,
  Clock,
  Radio,
  Plus,
} from 'lucide-react';
import { Event, Registration, Announcement } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/context/realtime-context';
import { EventCard } from '@/components/resident/EventCard';
import { MyParticipationCard } from '@/components/resident/MyParticipationCard';
import { DEMO_EVENT_ID } from '@/lib/demo/demo-data';

export default function ResidentHomePage() {
  const { currentSociety, user } = useAuth();
  const { lastEvent } = useRealtime();

  const [events, setEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (!currentSociety) return;
    const evts = db.getEvents(currentSociety.id);
    setEvents(evts);

    if (user) {
      const allRegs = db.getRegistrations(DEMO_EVENT_ID);
      const userRegs = allRegs.filter((r) => r.submitted_by === user.id);
      setMyRegistrations(userRegs);
    }

    const anns = db.getAnnouncements(DEMO_EVENT_ID);
    setAnnouncements(anns);
  }, [currentSociety, user, lastEvent]);

  const activeMyAct = myRegistrations[0];
  const upcomingEvents = events.filter((e) => e.status !== 'completed' && e.status !== 'archived');

  return (
    <div className="space-y-8">
      {/* 1. RESIDENT WELCOME HERO */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-highlight border border-amber-500/20 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
            <span>Welcome, {user?.full_name || 'Resident'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Celebrate Culture & Stage Arts at {currentSociety?.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
            Register your performance acts, submit audio tracks, view scheduled slots, and enjoy festival evenings together.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              href="/resident/events"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-102 flex items-center gap-1.5"
            >
              <span>Explore Upcoming Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href={`/resident/events/${DEMO_EVENT_ID}/register`}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Register New Act</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. RECENT ANNOUNCEMENT TICKER (IF ANY) */}
      {announcements.length > 0 && (
        <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 flex items-start gap-3 bg-amber-500/5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Notice: {announcements[0].announcement_type.replace('_', ' ')}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">{announcements[0].title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{announcements[0].message}</p>
          </div>
        </div>
      )}

      {/* 3. MY ACTIVE PARTICIPATION CARD SPOTLIGHT */}
      {activeMyAct && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>My Active Performance</span>
            </h2>
            <Link
              href="/resident/my-participation"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View All Acts ({myRegistrations.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <MyParticipationCard
            registration={activeMyAct}
            event={events.find((e) => e.id === activeMyAct.event_id)}
            performance={activeMyAct.performance}
            media={activeMyAct.media}
          />
        </div>
      )}

      {/* 4. UPCOMING EVENTS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Society Cultural Calendar</span>
            </h2>
            <p className="text-xs text-slate-400">Festivals, musical nights, and talent competitions</p>
          </div>
          <Link
            href="/resident/events"
            className="text-xs font-bold text-slate-400 hover:text-white"
          >
            See All ({events.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      </div>
    </div>
  );
}
