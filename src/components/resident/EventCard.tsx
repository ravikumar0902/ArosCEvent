'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Event } from '@/types/database';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate, formatTime } from '@/lib/utils';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const isRegistrationOpen = event.status === 'registration_open';
  const isLive = event.status === 'live';

  return (
    <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-amber-500/30 transition-all duration-300 group hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex flex-col">
      {/* Cover Image */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
        <img
          src={event.cover_image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&fit=crop&q=80'}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute top-3 left-3">
          <StatusBadge type="event" status={event.status} size="sm" />
        </div>

        {isLive && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-black text-[11px] shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>ON STAGE NOW</span>
          </div>
        )}

        <div className="absolute bottom-3 left-4 right-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
            {event.event_type}
          </span>
          <h3 className="text-lg font-black text-white leading-tight group-hover:text-amber-300 transition-colors truncate">
            {event.name}
          </h3>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        <div className="space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{formatDate(event.start_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{formatTime(event.start_at)} - {formatTime(event.end_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Action CTA */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <Link
            href={`/resident/events/${event.id}`}
            className="text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            View Details
          </Link>

          {isLive ? (
            <Link
              href={`/events/${event.id}/live`}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(239,68,68,0.4)]"
            >
              <span>Watch Live</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : isRegistrationOpen ? (
            <Link
              href={`/resident/events/${event.id}/register`}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:scale-102"
            >
              <span>Participate</span>
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            </Link>
          ) : (
            <Link
              href={`/resident/events/${event.id}`}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Schedule
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
