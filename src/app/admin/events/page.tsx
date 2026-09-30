'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Plus, Radio, ArrowRight, Clock, MapPin, Users2 } from 'lucide-react';
import { Event } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/context/realtime-context';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate, formatTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminEventsPage() {
  const { currentSociety, user } = useAuth();
  const { lastEvent } = useRealtime();

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!currentSociety) return;
    setEvents(db.getEvents(currentSociety.id));
  }, [currentSociety, lastEvent]);

  const handleUpdateStatus = (eventId: string, newStatus: any) => {
    try {
      db.updateEvent(eventId, { status: newStatus }, user?.id || 'admin');
      toast.success(`Event status changed to ${newStatus.replace('_', ' ').toUpperCase()}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl glass-panel-highlight border border-white/10">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
            Festival Calendar
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Society Cultural Events
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage registrations, schedules, and live stages for {currentSociety?.name}.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <div key={event.id} className="p-5 rounded-3xl glass-panel border border-white/5 space-y-4 hover:border-amber-500/30 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <StatusBadge type="event" status={event.status} size="sm" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  {event.event_type}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white leading-tight">{event.name}</h3>
              <p className="text-xs text-slate-300 line-clamp-2">{event.description}</p>

              <div className="space-y-1.5 text-xs text-slate-400 pt-1 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatDate(event.start_at)} ({formatTime(event.start_at)} - {formatTime(event.end_at)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{event.venue}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {event.status === 'draft' && (
                  <button
                    onClick={() => handleUpdateStatus(event.id, 'published')}
                    className="px-2.5 py-1 rounded-lg bg-blue-950 text-blue-300 font-semibold text-[11px]"
                  >
                    Publish
                  </button>
                )}
                {event.status === 'published' && (
                  <button
                    onClick={() => handleUpdateStatus(event.id, 'registration_open')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 font-semibold text-[11px]"
                  >
                    Open Reg
                  </button>
                )}
                {event.status === 'registration_open' && (
                  <button
                    onClick={() => handleUpdateStatus(event.id, 'live')}
                    className="px-2.5 py-1 rounded-lg bg-red-950 text-red-300 font-semibold text-[11px]"
                  >
                    Set Live
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/events/${event.id}/live`}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Live</span>
                </Link>
                <Link
                  href="/admin/lineup"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                >
                  Lineup
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
